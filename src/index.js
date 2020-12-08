import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

const lookupOps =[
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' }
];
const isJsonParsable = string => {
  try {
      JSON.parse(string);
  } catch (e) {
      return false;
  }
  return true;
}


export const App = ({sdk}) => {
  const [ctvalue, setCtValue] = useState(sdk.field.getValue());
  const [lktype,setLktype] = useState(sdk.parameters.instance.lookupContentType);
  const [lkfield,setLkfield] = useState(sdk.parameters.instance.lookupContentField); //useState(sdk.field.id);//when ready use thie one
  const [lkmulti,setLkmulti] = useState(sdk.parameters.instance.multiSelection);
  const [candies,setCandies]=useState(ctvalue);
  const [lookupvalues, setLookupvalues]=useState([{ value: 'aaa', label: 'aaa' }]);
  
  const onExternalChange = value => {
    setCtValue(value);
  }

  useEffect(()=>{
    if(candies){
      if(lkmulti){
        if(Array.isArray(candies)){
          const jCandies=[];
          candies.map(c=>{
            if(isJsonParsable(c.value)) {
              return jCandies.push({label: c.label, value: JSON.parse(c.value)})
            } else {
              jCandies.push({label: c.label, value: c.value})
            }            
          });
          sdk.field.setValue(jCandies);
        } else {
          sdk.field.setValue(candies);
        }        
      } else {
        if (isJsonParsable(candies.value)){
          sdk.field.setValue({label:candies.label,value: JSON.parse(candies.value)});
        } else {
          sdk.field.setValue({label:candies.label,value: candies.value});
        }
      }
    }
    //sdk.field.setValue(candies);
    
    // if(candies !==undefined && candies.value !==undefined){
    //   sdk.entry.fields['testReference'].setValue(candies.value);
    // }    
  },[candies]);

  useEffect(() => {
    sdk.window.startAutoResizer();
    const lookUpValues=[];
    sdk.space.getEntries( {
          content_type: 'lookupValue',
          skip:0,
          limit:200,
          'fields.lookupOfWhichContentType[all]': lktype,
          'fields.lookupOfWhichField[all]': lkfield
      }).then((response)=>{
        // response.items.map((item)=>lookUpValues.push({label:item.fields.lookupValue['en-CA'],value:item.sys.id + '|' 
        // + item.fields.lookupValue['en-CA'] 
        // + "|" + item.fields.lookupValue['fr-CA'] }));
        response.items.map((item)=>lookUpValues.push({label:item.fields.lookupValue['en-CA'],value:JSON.stringify({sys:{type:'Link',linkType:'Entry',id:item.sys.id}})}));
        //response.items.map((item)=>lookUpValues.push({label:item.fields.lookupValue['en-CA'],value:{sys:{type:'Link',linkType:'Entry',id:item.sys.id}},key:item.sys.id}));
        //response.items.map((item)=>lookUpValues.push({label:item.fields.lookupValue['en-CA'],value:item.sys.id}));
        setLookupvalues(lookUpValues.sort((a,b)=>(a.label.toLowerCase()>b.label.toLowerCase())?1:((b.label.toLowerCase()>a.label.toLowerCase())?-1:0))); //be aware that it is case sensitive
      })
      .catch((err)=>{
        console.log(err);
        setLookupvalues([{ value: 'error', label: 'error' }])
      })
  }, []);

  useEffect(() => {
    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    const detatchValueChangeHandler = sdk.field.onValueChanged(onExternalChange);
    return detatchValueChangeHandler;
  });

  if(lkmulti){
    return (
      <div className='jhtext1'>
      <Select 
        options={lookupvalues} 
        isMulti={lkmulti} 
        placeholder={'add ' + lkfield}
        defaultValue={
          ctvalue && ctvalue.map(v=>{return{value:JSON.stringify(v.value),label:v.label}})
        } 
        onChange={setCandies} />
      </div>
    );
  }
  return (
    <div className='jhtext1'>
    <Select 
      options={lookupvalues} 
      isMulti={lkmulti} 
      placeholder={'add ' + lkfield}
      defaultValue={ctvalue && {label:ctvalue.label,value: JSON.stringify(ctvalue.value)}} 
      onChange={setCandies} />
    </div>
  );
}

App.propTypes = {
  sdk: PropTypes.object.isRequired
};

init(sdk => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
