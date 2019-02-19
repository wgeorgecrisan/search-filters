import React, { Component } from 'react';
import './App.sass';
import content from './contentfromv2.json';
import _ from 'underscore';
import Select from 'react-select';
import {ButtonToolbar , Button} from 'react-bootstrap';

var filtersState = content.validfilters;
let allGlobalFilters = [];

_.map(filtersState,(element,key)=>{
        _.each(element,(element, filter)=>{
          allGlobalFilters.push({filtername: filter, options: element});
        });
});



class SelectList extends Component {
   constructor(props){
      super(props);
      this.state = {
        globalfilters: this.props.globalfilters,
        alphgroup: 0,
        alphrange: 0,
        totalCollections: [],
        totalGroups: [],
        selectedCollection: [],
        selectedFilter: {},
        selectedOperator: ''
        
      }
      this.optionsForOperator = this.optionsForOperator.bind(this);
      this.optionsForFilter1 = this.optionsForFilter1.bind(this);
      this.handleFilter1 = this.handleFilter1.bind(this);
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
            case '*':
              label = 'Starts with';
              break;
            case '/':
              label = 'Between';
              break;
            case '!=':
              label = 'Does not equal'
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

   handleFilter1(selectedOption) {
      if(selectedOption !== null)
        this.setState({selectedFilter: selectedOption});
      else 
        this.setState({selectedFilter: {}});  
   }

   handleChangeOperator = (operator) => {
      this.setState({selectedOperator: operator});  
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

   render () {
      //let options = this.optionsForFilterType();
      let optionsFilter = this.optionsForFilter1(this.state.selectedCollection),
          optionsOperator = this.optionsForOperator(this.state.selectedFilter);
      

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
          <div className='selectcontainer'>

            <Select className='beautify' autoFocus
               isSearchable isDisabled={this.state.alphgroup > 0 ? false : true } isClearable
              placeholder='Type to search ... '
              value={this.state.filterType}
              onChange={this.handleFilter1}
              options={optionsFilter}
            />
   
            {Object.keys(this.state.selectedFilter).length > 0 && <Select className='operators' isSearchable 
              placeholder='Operators'
              value={this.state.selectedOperator}
              onChange={this.handleChangeOperator}
              options={optionsOperator}
            />}
          </div>
        </React.Fragment>
        );
   }
}

class Filter extends Component {
  constructor(props) {
    super(props);

    this.state = {}
  }


  render() {
     return (<div>'I am an filter individual' </div>);
  } 
}



class SearchFilters extends Component {
  constructor(props){
    super(props);

    this.state = {
      globalfilters: [],
      selectedfilters: []
    };
  }

  componentDidMount() {
    this.setState({globalfilters: allGlobalFilters});
  }

  render() {
    return (
      
      <div className="main-container">
          <div className='header'> Search Filter TOCC Api v2 </div>
          <SelectList globalfilters={this.state.globalfilters} />
      </div>
    );
  }
}




export default SearchFilters;
