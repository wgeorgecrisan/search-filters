import React, { Component } from 'react';
import './App.sass';
import content from './contentfromv2.json';
import _ from 'underscore';
import Select from 'react-select';
import { Button , Form} from 'react-bootstrap';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import PropTypes from 'prop-types'; 
import "react-datepicker/dist/react-datepicker.css";

var filtersStateFromJson = content.validfilters;

class SearchFilterParent extends Component {
   constructor(props){
      super(props);
      this.state = {
        globalfilters: this.props.globalfilters,
        alphgroup: 0,
        alphrange: 0,
        totalCollections: [],
        totalGroups: [],
        selectedCollection: [],
        selectedFilter: '',
        selectedFiltersCollection: []
      }

      this.optionsForOperator = this.optionsForOperator.bind(this);
      this.optionsForFilter1 = this.optionsForFilter1.bind(this);
      this.handleFilterChange1 = this.handleFilterChange1.bind(this);
   }


   componentDidUpdate(prevProps){
       if(prevProps.globalfilters !== this.props.globalfilters){
          this.setState({globalfilters: this.props.globalfilters});
       }
   }


   optionsForOperator(selectedObject) {
      let options = [];

      if(selectedObject !== null && Object.keys(selectedObject || {}).length > 0){
        _.each(selectedObject.value.options.operators,(operator, key)=>{
          var label = 'Equals';

          switch (operator) {
            case '>':
              label = 'Greater than or equals';
              break;
            case '<':
              label = 'Less than or equals';
              break;
            case '|':
              label = 'In';
              break;
            case '~':
              label = 'Contains';
              break;
            case '^':
              label = 'And(Ignore this operator)';
              break;  
            case '*':
              label = 'Starts with';
              break;
            case '/':
              label = 'Between';
              break;
            case '!=':
              label = 'Does not equal'
              break;
            default:
              label = 'Equals'
            }
          options.push({ value: operator  , label: label });
       });
      }
     
      return options;
   }

   optionsForFilter1(list) {
    let options = [];

    if(list){
      _.each(list,(element, key)=>{
        options.push({ value: element  , label: element.filtername + ' - ' + element.options.description });
     });
    }
     
    return options;
   }

   removeFilter = (event)=> {
     event.preventDefault();
     let key = event.currentTarget.value;
     var collection = this.state.selectedFiltersCollection;

      collection.splice(key,1);
      this.setState({selectedFiltersCollection: collection});
    
   }

   handleFilterChange1(selectedOption) {
      var selectedFiltersCollection = this.state.selectedFiltersCollection;

      if(selectedOption !== null){
        selectedOption.selectedOperator = '';
        selectedOption.selectedValue = '';
        if(selectedOption.value.options.type === 'date') {
          var date = new Date();
          selectedOption.selectedValue = moment(date).format('YYYY-MM-DD');
        } else if( selectedOption.value.options.type === 'boolean') {
          selectedOption.selectedValue = false;
        } else if( selectedOption.value.options.type === 'number') {
          selectedOption.selectedValue = 0;
        } else if (selectedOption.value.options.type === 'datetime'){
          selectedOption.selectedValue = moment().format('YYYY-MM-DD HH:mm:ss');
        }

        selectedFiltersCollection.push(selectedOption);
        this.setState({selectedFilter: {} , selectedFiltersCollection: selectedFiltersCollection});
      }
        
      else 
        this.setState({selectedFilter: {}});  
   }


   handleButtonClick = (event)=> {
      var nr = event.target.value;
    this.setState({ alphgroup: nr , selectedCollection: this.state.totalCollections[nr - 1]});
   }

   updateParentSelectedFiltersCollection = (data, parent, keyme, multiple)=>{
     var dataToUpdate = this.state.selectedFiltersCollection;
    _.map(dataToUpdate, (element,key)=>{
          if(key === keyme && element.label === parent.label) {
            if(data.type === 'operator'){
              element.selectedOperator = data.value;
            } else if (data.type === 'entity') {
              element.label = data.value.label;
              element.value = data.value.value;
              element.selectedOperator = data.selectedOperator;
            } else if (data.type === 'filtervalue'){
                element.selectedValue = data.value;
            }
          }
    });
    
    this.props.getdatafromchild(dataToUpdate);
    this.setState({selectedFiltersCollection: dataToUpdate});
   }

   render () {
      let optionsFilter = this.optionsForFilter1(this.state.globalfilters);
      var filterContainerArray = [];
        
        if(this.state.selectedFiltersCollection.length > 0){
          var propsFilterContainerArrayElements = {
            alphgroup: this.state.alphgroup,
            updateParentSelectedFiltersCollection: this.updateParentSelectedFiltersCollection,
            optionsForOperator: this.optionsForOperator,
            optionsFilter: optionsFilter,
            selectedFilter: this.state.selectedFilter,
            handleChangeOperator: this.handleChangeOperator,
            handleFilterChange1: this.handleFilterChange1,
            getFilterValue: this.getFilterValue,
            removeFilter: this.removeFilter
          }

          _.each(this.state.selectedFiltersCollection,(element,i)=>{
              propsFilterContainerArrayElements.selectedFilter = element;
              filterContainerArray.push(<FilterContainerElement key={element.value.filtername +  i} keyme={i} {...propsFilterContainerArrayElements} />);
          });
        } 
          

       return (
        <React.Fragment>
          {filterContainerArray}  
          <div className='selectcontainer-initial'>
             <div className='new-filter'> Add new filter</div>
            <Select className='beautify'
              isSearchable isDisabled={false } isClearable
              placeholder='Type to search ... '
              value={Object.keys(this.state.selectedFilter).length > 0 ? this.state.selectedFilter : ''}
              onChange={this.handleFilterChange1}
              options={optionsFilter}
            />
            <div className='infos'>
              <span> {this.state.globalfilters ? this.state.globalfilters.length : null} Filters for category: <span> {String(this.props.category).toUpperCase() }</span> </span>
            </div>
          </div>

        </React.Fragment>
        );
   }
}

class FilterContainerElement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOperator: this.props.selectedFilter.selectedOperator,
      selectedFilter: this.props.selectedFilter,
      selectedValue: this.props.selectedFilter.selectedValue,
      optionsOperator: [],
    }

  }
 
  handleChangeValueFromTo = (event) => {
      
    let type = this.state.selectedFilter.value.options.type;

      if( type === 'number' || type === 'string') {
        if(event.currentTarget.attributes.position.value === 'first'){

           this.setState({selectedValue: { from: event.currentTarget.value , to: this.state.selectedValue.to || '' }},()=>{
            this.props.updateParentSelectedFiltersCollection({value: this.state.selectedValue, type: "filtervalue"}, this.state.selectedFilter, this.props.keyme, true);
           });

        } else if (event.currentTarget.attributes.position.value === 'second') {

          this.setState({selectedValue: {  to: event.currentTarget.value , from: this.state.selectedValue.from || '' }},()=>{
            this.props.updateParentSelectedFiltersCollection({value: this.state.selectedValue, type: "filtervalue"}, this.state.selectedFilter, this.props.keyme, true);
          });

        }
      } 
  }

  handleChangeStart = (date) => {
      var dateState = this.state.selectedValue;

      if(typeof dateState !== 'object') {
        dateState = {from: new Date() , to: moment().format('YYYY-MM-DD')};
      }

      dateState.from = moment(date).format('YYYY-MM-DD');

      this.setState({selectedValue: dateState},()=>{
        this.props.updateParentSelectedFiltersCollection({value: this.state.selectedValue, type: "filtervalue"}, this.state.selectedFilter, this.props.keyme, true);
      });
  }

  handleChangeStartDT = (date) => {
    var dateState = this.state.selectedValue;

    if(typeof dateState !== 'object') {
      dateState = {from: new Date() , to: moment().format('YYYY-MM-DD HH:mm:ss')};
    }

    dateState.from = moment(date, 'YYYYMMDD HHmmss').format('YYYY-MM-DD HH:mm:ss');

    this.setState({selectedValue: dateState},()=>{
      this.props.updateParentSelectedFiltersCollection({value: this.state.selectedValue, type: "filtervalue"}, this.state.selectedFilter, this.props.keyme, true);
    });
}

  handleChangeEnd = (date) => {
    var dateState = this.state.selectedValue;

    if(typeof dateState !== 'object') {
      dateState = {from: moment().format('YYYY-MM-DD') , to: new Date()};
    }

    dateState.to = moment(date).format('YYYY-MM-DD');

    this.setState({selectedValue: dateState}, ()=>{
      this.props.updateParentSelectedFiltersCollection({value: this.state.selectedValue, type: "filtervalue"}, this.state.selectedFilter, this.props.keyme, true);
    });
  }

  handleChangeEndDT = (date) => {
    var dateState = this.state.selectedValue;

    if(typeof dateState !== 'object') {
      dateState = {from: moment().format('YYYY-MM-DD HH:mm:ss') , to: new Date()};
    }

    dateState.to = moment(date,'YYYYMMDD HHmmss').format('YYYY-MM-DD HH:mm:ss');

    this.setState({selectedValue: dateState}, ()=>{
      this.props.updateParentSelectedFiltersCollection({value: this.state.selectedValue, type: "filtervalue"}, this.state.selectedFilter, this.props.keyme, true);
    });
  }

  componentDidMount(){
    var optionsOperator = this.props.optionsForOperator(this.state.selectedFilter);
    this.setState({ optionsOperator: optionsOperator});
  }

  handleChangeOperator = (operator) => {
    this.props.updateParentSelectedFiltersCollection({value: operator , type: "operator"}, this.state.selectedFilter,this.props.keyme);
    this.setState({selectedOperator: operator });  
  }

  handleChangeFilter = (filter) => {
    this.props.updateParentSelectedFiltersCollection({value: filter , type: "entity"}, this.state.selectedFilter,this.props.keyme);
    this.setState({selectedFilter: filter});  
 }

  handleChangeValue = (event) =>{
    var value = event.currentTarget.value;
      this.props.updateParentSelectedFiltersCollection({value: value , type: "filtervalue"}, this.state.selectedFilter, this.props.keyme);
      this.setState({selectedValue: value}); 
  }

  handleChangeValueCheckbox = (event) =>{
    var value = event.currentTarget.checked;
      this.props.updateParentSelectedFiltersCollection({value: value , type: "filtervalue"}, this.state.selectedFilter, this.props.keyme);
      this.setState({selectedValue: value});  
  }

  handleChangeValueDate = (date) =>{
    var value = moment(date).format('YYYY-MM-DD');
      this.props.updateParentSelectedFiltersCollection({value: value , type: "filtervalue"}, this.state.selectedFilter, this.props.keyme);
      this.setState({selectedValue: value});  
  }

  handleChangeValueDateDT = (date) =>{
    var value = moment(date,'YYYYMMDD HHmmss').format('YYYY-MM-DD HH:mm:ss');
      this.props.updateParentSelectedFiltersCollection({value: value , type: "filtervalue"}, this.state.selectedFilter, this.props.keyme);
      this.setState({selectedValue: value});  
  }

 componentDidUpdate(prevProps, prevState) {
      if(prevProps.selectedFilter !== this.props.selectedFilter){
        this.setState({selectedFilter: this.props.selectedFilter , selectedOperator: this.props.selectedFilter.selectedOperator },function(){
          var  optionsOperator = this.props.optionsForOperator(this.state.selectedFilter);

          this.setState({optionsOperator: optionsOperator});
        });
      }
 }  

 
 getFilterValue = () => {
    
  let defaultValue = this.state.selectedValue, currentFilterState = this.state.selectedFilter, currentOperator = this.state.selectedOperator.value;

  switch(currentFilterState.value.options.type){
    case 'datetime':
      var selectValueDT = moment(defaultValue).toDate();
      if (currentOperator === "/") {
        if(typeof this.state.selectedValue !== 'object'){
          selectValueDT = {from: new Date() , to: new Date()};
              return ( 
                <React.Fragment>  
                  <DatePicker selected={ selectValueDT.from } selectsStart showTimeSelect className='date-picker-style'   dateFormat="yyyy/MMMM/d h:mm aa" re onChange={ this.handleChangeStartDT } />
                    {<span className='between'> {" to " }</span>}
                  <DatePicker selected={ selectValueDT.to } selectsEnd showTimeSelect className='date-picker-style date-picker-style2'   dateFormat="yyyy/MMMM/d h:mm aa"  onChange={ this.handleChangeEndDT } />
              </React.Fragment> );
         } else {
          return ( 
            <React.Fragment>  
              <DatePicker selected={ moment(this.state.selectedValue.from).toDate() } showTimeSelect selectsStart startDate={moment(this.state.selectedValue.from).toDate()}  endDate={moment(this.state.selectedValue.to).toDate()} className='date-picker-style'  dateFormat="yyyy/MMMM/d h:mm aa" re onChange={ this.handleChangeStartDT } />
                {<span className='between'> {" to " }</span>}
              <DatePicker selected={moment(this.state.selectedValue.to).toDate() } showTimeSelect  selectsEnd startDate={moment(this.state.selectedValue.from).toDate()} endDate={moment(this.state.selectedValue.to).toDate()} className='date-picker-style date-picker-style2'   dateFormat="yyyy/MMMM/d h:mm aa"  onChange={ this.handleChangeEndDT } />
          </React.Fragment> ); 
         }
        
      } else {
        return ( <DatePicker selected={ selectValueDT } showTimeSelect className='date-picker-style' dateFormat="yyyy/MMMM/d h:mm aa"  onChange={ this.handleChangeValueDateDT } />);
      }
    case 'date':
      var selectValue = moment(defaultValue).toDate();
      if (currentOperator === "/") {
        if(typeof this.state.selectedValue !== 'object'){
          selectValue = {from: new Date() , to: new Date()};
              return ( 
                <React.Fragment>  
                  <DatePicker selected={ selectValue.from } selectsStart className='date-picker-style'   dateFormat="yyyy/MM/dd" re onChange={ this.handleChangeStart } />
                    {<span className='between'> {" to " }</span>}
                  <DatePicker selected={ selectValue.to } selectsEnd className='date-picker-style date-picker-style2'   dateFormat="yyyy/MM/dd"  onChange={ this.handleChangeEnd } />
              </React.Fragment> );
         } else {
          return ( 
            <React.Fragment>  
              <DatePicker selected={ moment(this.state.selectedValue.from).toDate() } selectsStart startDate={moment(this.state.selectedValue.from).toDate()}  endDate={moment(this.state.selectedValue.to).toDate()} className='date-picker-style'  dateFormat="yyyy/MM/dd" re onChange={ this.handleChangeStart } />
                {<span className='between'> {" to " }</span>}
              <DatePicker selected={moment(this.state.selectedValue.to).toDate() } selectsEnd startDate={moment(this.state.selectedValue.from).toDate()} endDate={moment(this.state.selectedValue.to).toDate()} className='date-picker-style date-picker-style2'   dateFormat="yyyy/MM/dd"  onChange={ this.handleChangeEnd } />
          </React.Fragment> ); 
         }
        
      } else {
        return ( <DatePicker selected={ selectValue } className='date-picker-style' dateFormat="yyyy/MM/dd"  onChange={ this.handleChangeValueDate } />);
      }
    case 'boolean':
      return (<Form.Check type="checkbox" className='checkbox-style' checked={ defaultValue }  onChange={ this.handleChangeValueCheckbox } label="True/False" />) 
    case 'string':
    if (currentOperator === "/") {
       if(typeof this.state.selectedValue !== 'object'){
        defaultValue = {from: '' , to: ''};
          return (
            <React.Fragment> 
              <Form.Control className='value-container-style'  position={'first'} value={ defaultValue.from } onChange={this.handleChangeValueFromTo} type="text" placeholder="Enter value from (string)..." />
                {<span className='between'> {" to " }</span>}
              <Form.Control className='value-container-style value-container-style2' position={'second'}  value={ defaultValue.to } onChange={this.handleChangeValueFromTo} type="text" placeholder="Enter value to (string)..." />
            </React.Fragment>);
       } else {
        return (
          <React.Fragment> 
            <Form.Control className='value-container-style' position={'first'}  value={ defaultValue.from } onChange={this.handleChangeValueFromTo} type="text" placeholder="Enter value from (string)..." />
              {<span className='between'> {" to " }</span>}
            <Form.Control className='value-container-style value-container-style2' position={'second'}   value={ defaultValue.to } onChange={this.handleChangeValueFromTo} type="text" placeholder="Enter value to (string)..." />
          </React.Fragment>);
       }
    } else {
      return (<Form.Control className='value-container-style' value={ defaultValue } onChange={this.handleChangeValue} type="text" placeholder="Enter value (string)..." />);  
    }   
    case 'number':
      if (currentOperator === "/") {
       if(typeof this.state.selectedValue !== 'object'){
         defaultValue = {from: '' , to: ''};
          return (
            <React.Fragment> 
              <Form.Control className='value-container-style' position={'first'}   value={ defaultValue.from } onChange={this.handleChangeValueFromTo} type="number" placeholder="Enter value from (number)..." />
                {<span className='between'> {" to " }</span>}
              <Form.Control className='value-container-style value-container-style2' position={'second'}   value={ defaultValue.to } onChange={this.handleChangeValueFromTo} type="number" placeholder="Enter value to (number)..." />
            </React.Fragment>);
         
       } else {
        return (
          <React.Fragment> 
            <Form.Control className='value-container-style'  position={'first'}  value={ defaultValue.from } onChange={this.handleChangeValueFromTo} type="number" placeholder="Enter value from (number)..." />
              {<span className='between'> {" to " }</span>}
            <Form.Control className='value-container-style value-container-style2' position={'second'}  value={ defaultValue.to } onChange={this.handleChangeValueFromTo} type="number" placeholder="Enter value to (number)..." />
          </React.Fragment>);
       }
      } else {
        return (<Form.Control className='value-container-style' value={ defaultValue } onChange={this.handleChangeValue} type="number" placeholder="Enter value type (number)..." />);
      }
    
    default:
      return (<Form.Control className='value-container-style' value={ defaultValue } onChange={this.handleChangeValue} type="text" placeholder="Enter value ..." />);
    }



  
} 

  render() {


     return (
     <React.Fragment>
      
      <div className='selectcontainer new-div'>
      <Select className='beautify'
        isSearchable isDisabled={ false } isClearable={false}
        placeholder='Type to search ... '
        value={this.state.selectedFilter}
        onChange={this.handleChangeFilter}
        options={this.props.optionsFilter}
     />

     {this.state.selectedFilter && <Select className='operators' isSearchable 
        placeholder='Operators'
        value={this.state.selectedOperator}
        onChange={this.handleChangeOperator}
        options={this.state.optionsOperator}
      />}

      {this.state.selectedOperator && this.getFilterValue() }
      <Button variant="outline-danger" size="sm"  className='x-button' value={this.props.keyme} onClick={ this.props.removeFilter }>X</Button>
    </div>
   </React.Fragment>);
  } 
}



class SearchFilters extends Component {
  constructor(props){
    super(props);

    this.state = {
      localfilters: [],
      selectedFiltersQueryString: '',
      collectionSelectedFilters: [],
      loadedCategories: [],
      categorySelected: this.props.category || false,  //required prop to work
      globalfilters: false
    };
  }

  

  search = ()=>{
    let theExpectedString = '', dataforqs = this.state.collectionSelectedFilters;

      _.each(dataforqs,(elm,key)=>{

        theExpectedString += 'filter=' + elm.value.filtername; 
          if(typeof elm.selectedValue === 'object'){
            theExpectedString += elm.selectedValue.from + '/' + elm.selectedValue.to + '&';
          } else {
            theExpectedString +=  '=' + (elm.selectedOperator.value || '') + (elm.selectedValue || '') + '&';
          }
      });
 
      this.setState({selectedFiltersQueryString: theExpectedString},()=>{
        this.props.callbackProp(this.state.selectedFiltersQueryString);
      });
  }

  getdatafromchild = (data)=>{
    this.setState({collectionSelectedFilters: data});
  }

  componentDidMount() {
    this.loadAllFilters();
  }
  
  loadAllFilters = () => {

      let allFiltersByCategory = filtersStateFromJson; // loaded valid filters from json file
      
      this.setState({ globalfilters: allFiltersByCategory }, ()=>{

              if(this.props.category){
                  let localfiltersarray = [];
                  let localfilters = this.state.globalfilters[this.props.category];
                  _.each(localfilters, (element, filter) => {
                    localfiltersarray.push({filtername: filter, options: element});
                  });                
                this.setState({localfilters: localfiltersarray})
              }
      });  
  }

  render() {
    return (
      
      <div className="main-container">
          <div className='header'> Search Filter TOCC Api v2 </div>
          <SearchFilterParent getdatafromchild={this.getdatafromchild} callbackProp={this.props.callbackProp} category={this.props.category} globalfilters={this.state.localfilters} />
          <Button variant="outline-primary"  className='search-button' value={''} onClick={ this.search }>Initiate Search</Button>
          <div className='final-string'>{this.state.selectedFiltersQueryString}<p> filter = name  = operator = value  </p></div>
      </div>
    );
  }
}

SearchFilters.propTypes = {
  category: PropTypes.string.isRequired,
  callbackProp: PropTypes.func.isRequired
}


export default SearchFilters;
