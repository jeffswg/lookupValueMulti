import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

const isJson=str=>{try {JSON.parse(str);} catch (e) {return false;}return true;};

export const App = ({sdk}) => {
  const [value, setValue] = useState(sdk.field.getValue() || []);
  const [lktype,setLktype] = useState(sdk.parameters.instance.lookupContentType);
  const [lkfield,setLkfield] = useState(sdk.parameters.instance.lookupContentField); //useState(sdk.field.id);//when ready use thie one
  const [lkmulti,setLkmulti] = useState(sdk.parameters.instance.multiSelection);
  const [nativeField,setNativeField] = useState(sdk.parameters.instance.lookupActualField);
  const [candies,setCandies]=useState(sdk.field.getValue() ||[]);
  const [lookupvalues, setLookupvalues]=useState([]);
  
  const onExternalChange = value => {
    setValue(value)
  }

  useEffect(()=>{
    const selectedVals=[];
    if(candies !==undefined && Array.isArray(candies)){
      candies.map((m)=>{if(isJson(m.value)) {return selectedVals.push(JSON.parse(m.value))}})
      //console.log(selectedVals);
    }
    
    sdk.field.setValue(candies);
    if(lkmulti){
      if(candies !==undefined && selectedVals !==undefined && selectedVals.length>=0){
        sdk.entry.fields[nativeField].setValue(selectedVals);
      }
    } else {
      if(candies !==undefined && candies !==null && candies.value !==undefined && candies !==null && isJson(candies.value)){
        sdk.entry.fields[nativeField].setValue(JSON.parse(candies.value));
      }      
    } 
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

  return (
    <div className='jhtext1'>
    <Select 
      options={lookupvalues} 
      isMulti={lkmulti} 
      placeholder={'add ' + lkfield}
      defaultValue={value} 
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
