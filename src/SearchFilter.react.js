import React, { Component } from 'react';
import './App.sass';
import content from './contentfromv2.json';
import _ from 'underscore';
import Select from 'react-select';
import {ButtonToolbar , Button , Form} from 'react-bootstrap';
import moment from 'moment';


var filtersState = content.validfilters;
let allGlobalFilters = [];

_.map(filtersState,(element,key)=>{
        _.each(element,(element, filter)=>{
          allGlobalFilters.push({filtername: filter, options: element});
        });
});



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
      this.generateCharGroup = this.generateCharGroup.bind(this);
   }

   componentDidMount() {
       
      
   }

   divideOnGroups = (content)=>{
    var group1 = this.getGroups(1), group2 = this.getGroups(2) , group3 = this.getGroups(3), group4 = this.getGroups(4) , group5 = this.getGroups(5);
    var collection1 = [],  collection2 = [], collection3 = [] ,collection4 = [], collection5 = [];

    _.each(this.state.globalfilters,(element,key)=>{
        var char = element.filtername.charCodeAt(0);
        char = String.fromCharCode(char).toUpperCase();
        
        if(group1.includes(char)){
            collection1.push(element);
        } else if (group2.includes(char)) {
          collection2.push(element);
        } else if (group3.includes(char)) {
          collection3.push(element);
        } else if (group4.includes(char)) {
          collection4.push(element);
        } else if (group5.includes(char)) {
          collection5.push(element);
        }

        if(key === this.state.globalfilters.length -1){
          var totalGroups = [group1, group2 ,group3 , group4, group5];
          var totalCollections = [collection1, collection2, collection3, collection4, collection5];
          this.setState({totalCollections: totalCollections, totalGroups: totalGroups});
        }
    });
     
    
   }

   componentDidUpdate(prevProps){
       if(prevProps.globalfilters !== this.props.globalfilters){
          this.setState({globalfilters: this.props.globalfilters},function(){
            this.divideOnGroups(this.state.globalfilters);
          });
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
              label = 'Unknown***';
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
        selectedFiltersCollection.push(selectedOption);
        this.setState({selectedFilter: {} , selectedFiltersCollection: selectedFiltersCollection});
      }
        
      else 
        this.setState({selectedFilter: {}});  
   }

   generateCharGroup(char1,char2){
        let a = [], i = char1.charCodeAt(0), j = char2.charCodeAt(0);
        while(i <= j){
            a.push(String.fromCharCode(i));
            i++;
        }
        return a;
   }

   getGroups(group) {
        switch(group){
          case 1: 
            return this.generateCharGroup("A","E");
          case 2: 
            return this.generateCharGroup("F","J"); 
          case 3: 
            return this.generateCharGroup("K","O"); 
          case 4: 
            return this.generateCharGroup("P","T");
          case 5: 
            return this.generateCharGroup("U","Z");  
          default:
            return [];   
        }
   }

   handleButtonClick = (event)=> {
      var nr = event.target.value;
    this.setState({ alphgroup: nr , selectedCollection: this.state.totalCollections[nr - 1]});
   }

   updateParentSelectedFiltersCollection = (data, parent, keyme)=>{
     //use !!!! to update the value filter also
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

    this.setState({selectedFiltersCollection: dataToUpdate});
   }

   render () {
      let optionsFilter = this.optionsForFilter1(this.state.selectedCollection);
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
          <p className='p-info'>1. Select alphabethical group of filters </p>
          <ButtonToolbar>
            <Button variant="outline-secondary" size="sm" active={this.state.alphgroup === '1' ? true : false} className='g-button' value={1} onClick={ this.handleButtonClick  }>A to... E</Button>
            <Button variant="outline-secondary" size="sm" active={this.state.alphgroup === '2' ? true : false} className='g-button' value={2}  onClick={ this.handleButtonClick }>F to... J</Button>
            <Button variant="outline-secondary" size="sm" active={this.state.alphgroup === '3' ? true : false} className='g-button' value={3} onClick={ this.handleButtonClick }>K to... O</Button>
            <Button variant="outline-secondary" size="sm" active={this.state.alphgroup === '4' ? true : false} className='g-button' value={4}  onClick={ this.handleButtonClick }>P to... T</Button>
            <Button variant="outline-secondary" size="sm" active={this.state.alphgroup === '5' ? true : false} className='g-button' value={5} onClick={ this.handleButtonClick }>U to... Z</Button>
          </ButtonToolbar>
          <div className='infos'>
              <span> {this.state.totalCollections[0] ? this.state.totalCollections[0].length : null} Filters</span>
              <span> {this.state.totalCollections[1] ? this.state.totalCollections[1].length : null} Filters</span>
              <span> {this.state.totalCollections[2] ? this.state.totalCollections[2].length : null} Filters</span>
              <span> {this.state.totalCollections[3] ? this.state.totalCollections[3].length : null} Filters</span>
              <span> {this.state.totalCollections[4] ? this.state.totalCollections[4].length : null} Filters</span>
          </div>
          <p className='p-info2'>2. Select filter, operator and value </p>
          {filterContainerArray}
          
          <div className='selectcontainer-initial'>
             <div className='new-filter'> Add new filter</div>
            <Select className='beautify'
              isSearchable isDisabled={this.state.alphgroup > 0 ? false : true } isClearable
              placeholder='Type to search ... '
              value={Object.keys(this.state.selectedFilter).length > 0 ? this.state.selectedFilter : ''}
              onChange={this.handleFilterChange1}
              options={optionsFilter}
            />
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
      optionsOperator: []
    }
  }
 

  componentDidMount(){
    var optionsOperator = this.props.optionsForOperator(this.state.selectedFilter);
    this.setState({ optionsOperator: optionsOperator});
  }

  handleChangeOperator = (operator) => {
    this.props.updateParentSelectedFiltersCollection({value: operator , type: "operator"}, this.state.selectedFilter,this.props.keyme);
    this.setState({selectedOperator: operator});  
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

 componentDidUpdate(prevProps, prevState) {
      if(prevProps.selectedFilter !== this.props.selectedFilter){
        this.setState({selectedFilter: this.props.selectedFilter , selectedOperator: this.props.selectedFilter.selectedOperator },function(){
          var  optionsOperator = this.props.optionsForOperator(this.state.selectedFilter);

          this.setState({optionsOperator: optionsOperator});
        });
      }
 }  

 // function to modify for this project, borrowed from TAB2
 getFilterValue = () => {
    
  let defaultValue = this.state.selectedValue;

  /*
  if (defaultValue) {
    if (defaultValue[0] === this.state.operator || this.state.operator === '!=' && defaultValue[0] === '!') {
      // remove leading * or ^ or !
      defaultValue = defaultValue.substring(1);
    } else if (this.state.operator === '/') {
      // range
      defaultValue = defaultValue.split('/', 2);
      var defaultValueFrom = defaultValue[0];
      var defaultValueTo = defaultValue[1];
    }
  }

  if (this.isDate()) {
    if (this.state.operator == '/') { // between
      // if any of the default values are a string like 'today' or 'tomorrow', don't use a DateInput
      if (!(defaultValueFrom && !moment(defaultValueFrom).isValid() || defaultValueTo && !moment(defaultValueTo).isValid())) {
        return [
          <div className='field two wide' key={ 0 }><DateInput type={ this.getType() } freeForm={ this.state.freeForm } ref='valuefrom' defaultValue={ defaultValueFrom } /></div>,
          <div className='field two wide' key={ 1 }><DateInput type={ this.getType() } freeForm={ this.state.freeForm } ref='valueto' defaultValue={ defaultValueTo } /></div>,
        ];
      }
    }
    if (this.state.operator != '|' && !(defaultValue && !moment(defaultValue).isValid())) { // not 'in'
      return <div className='field four wide'><DateInput type={ this.getType() } freeForm={ this.state.freeForm } ref='value' defaultValue={ defaultValue } /></div>;
    }
  }

  var type = 'text';
  var pl = 'Enter value...';
  if (this.isBool()) {
    type = 'checkbox';
  } else if (this.isNumber()) {
    type = 'number';
  }

  if (this.state.operator == '/' && !this.isBool()) {
    return [
      <div className='field two wide' key={ 0 }><input type={ type } ref='valuefrom' placeholder='from' defaultValue={ defaultValueFrom } /></div>,
      <div className='field two wide' key={ 1 }><input type={ type } ref='valueto' placeholder='to' defaultValue={ defaultValueTo } /></div>,
    ];
  }
  if (this.state.operator == '=' || this.state.operator == '!=') {
    var select = this._getSelectFromProps(this.props);

    if (select) {
      if (['customer', 'owner', 'supplier'].indexOf(select.toLowerCase()) > -1) {
        var vprops = {
          ref: 'value',
          objectKey: select.toLowerCase().slice(0, 1).toUpperCase() + select.toLowerCase().slice(1),
          defaultValue: defaultValue
        };

        // special bodge for finding agency managed properties (where an agency is a supplier)
        if (this.props.filter.indexOf('activesupplierid') > -1) {
          return [
            <div className='field two wide' key={ 0 }>
              <FilterSelectionModal.GlobalSearchSelectField {...vprops} />
            </div>,
            <div className='field two wide' key={ 1 }>
              <AgencySelectList ref='supplieragency' defaultValue={ defaultValue } formField={ false } emptyOption />
            </div>
          ];
        }

        return (
          <div className='field four wide'>
            <FilterSelectionModal.GlobalSearchSelectField {...vprops} />
          </div>
        );
      }

      if (select.toLowerCase() === 'groupingvalue') {
        return (
          <div className='field four wide'>
            <BasicGroupingValueSelectList ref='value' formField={ false } />
          </div>
        );
      }

      if (select.toLowerCase() === 'grouping') {
        return (
          <div className='field four wide'>
            <GroupingSelectList ref='value' formField={ false } />
          </div>
        );
      }        

      if (select.toLowerCase() === 'office') {
        return (
          <div className='field four wide'>
            <OfficeSelectList ref='value' formField={ false } />
          </div>
        );
      }

      if (select.toLowerCase() === 'tabsuser') {
        vprops = {
          type: 'text',
          ref: 'value',
          placeholder: pl,
        };
        return <div className='field four wide'><input {...vprops} /></div>;
      }        

      vprops = {
        ref: 'value',
        defaultValue: defaultValue,
        entityType: select,
        optionValue: 'id'
      };
      return <div className='field four wide'><FilterSelectionModal.SelectList {...vprops} /></div>;
    }

    if (this.props.filter === 'changedaytemplatetype') {
      return (
        <div className='field four wide'>
          <select ref='value' defaultValue={ defaultValue }>
            <option>Base</option>
            <option>Branding</option>
            <option>Property</option>
          </select>
        </div>
      );
    }
  }

  if (this.state.operator == '|') {
    type = 'text';
    pl = 'Enter values separated by the pipe (|) symbol...';
  }

  vprops = {
    type: type,
    ref: 'value',
    placeholder: pl,
  };

  if (this.isBool()) {
    vprops.defaultChecked = defaultValue;
  } else {
    vprops.defaultValue = defaultValue;
  }

  return <div className='field four wide'><input {...vprops} /></div>;
  */

  return (<Form.Control className='value-container-style' value={this.state.selectedValue} onChange={this.handleChangeValue} type="text" placeholder="Enter value..." />);
} // end of value control to modify for this project

  render() {


     return (
     <React.Fragment>
      
      <div className='selectcontainer new-div'>
      <Select className='beautify'
        isSearchable isDisabled={this.props.alphgroup > 0 ? false : true } isClearable={false}
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
      globalfilters: [],
      selectedFiltersQueryString: ''
    };
  }

  search = ()=>{

  }

  componentDidMount() {
    this.setState({globalfilters: allGlobalFilters});
  }

  render() {
    return (
      
      <div className="main-container">
          <div className='header'> Search Filter TOCC Api v2 </div>
          <SearchFilterParent globalfilters={this.state.globalfilters} />
          <Button variant="outline-primary"  className='search-button' value={''} onClick={ this.search }>Initiate Search</Button>
      </div>
    );
  }
}




export default SearchFilters;
