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


export const App = ({sdk}) => {
  const [value, setValue] = useState(sdk.field.getValue() || [{ value: 'aaa', label: 'aaa' }]);
  const [lktype,setLktype] = useState(sdk.parameters.instance.lookupContentType);
  const [lkfield,setLkfield] = useState(sdk.parameters.instance.lookupContentField); //useState(sdk.field.id);//when ready use thie one
  const [lkmulti,setLkmulti] = useState(sdk.parameters.instance.multiSelection);
  const [candies,setCandies]=useState(sdk.field.getValue() ||[{value: 'ccc', label: 'ccc' }]);
  const [lookupvalues, setLookupvalues]=useState([{ value: 'aaa', label: 'aaa' }]);
  
  const onExternalChange = value => {
    setValue(value);
  }

  useEffect(()=>{
    sdk.field.setValue(candies);
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
        response.items.map((item)=>lookUpValues.push({label:item.fields.lookupValue['en-CA'],value:item.sys.id + '|' 
        + item.fields.lookupValue['en-CA'] 
        + "|" + item.fields.lookupValue['fr-CA'] }));
        setLookupvalues(lookUpValues.sort((a)=>a.label).reverse());
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
      placeholder={'add ' + sdk.parameters.instance.lookupContentType}
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
