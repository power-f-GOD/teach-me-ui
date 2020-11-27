import React from 'react';

import Row from 'react-bootstrap/esm/Row';

import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import InsertLinkIcon from '@material-ui/icons/InsertLink';

const QuestionEditorBody = ({ body, onChange }: any) => {
  const handleMakeBold = (e: any) => {

  }

  const handleMakeItalic = (e: any) => {

  }

  const handleMakeLink = (e: any) => {

  }
  
  return (
    <>
      <Row className='d-flex mx-auto mt-0'>
        <div className='d-flex mt-1'>
          <FormatBoldIcon onClick={handleMakeBold} color='inherit' className='mr-2 cursor-pointer'/>
          <FormatItalicIcon onClick={handleMakeItalic} color='inherit' className='mr-2 cursor-pointer'/>
          <InsertLinkIcon onClick={handleMakeLink} color='inherit' className='mr-2 cursor-pointer'/>
        </div>
        <textarea 
          required
          maxLength={1000}
          className='question-input' 
          id='question-body' 
          onChange={onChange} 
          rows={9} />
      </Row>
    </>
  )
}

export default QuestionEditorBody;