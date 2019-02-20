import React from 'react';
import ReactDOM from 'react-dom';
import './index.sass';
import SearchFilter from './SearchFilter.react';
import * as serviceWorker from './serviceWorker';

/**
 * @prop category 
 * @type string
 * You need to add a category to prop 'category' as a string 
 * 
 * possible values: 'actor' , 'actorpayment' , 'booking' , 'booking service' , 'contact',
 *                 'document', 'entity', 'note', 'property', 'sagepaypayment', 'specialoffer',
 *                  'ticket', 'transaction', 'workorder', 'workordersupplier';                  
 */

ReactDOM.render(<SearchFilter category='property' />, document.getElementById('root'));



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
