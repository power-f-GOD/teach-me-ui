import React, {
  // useState,
  useRef
}from 'react';

import Row from 'react-bootstrap/esm/Row';

import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import InsertLinkIcon from '@material-ui/icons/InsertLink';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import ImageIcon from '@material-ui/icons/Image';
import StrikethroughSIcon from '@material-ui/icons/StrikethroughS';
import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatAlignRightIcon from '@material-ui/icons/FormatAlignRight';
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import Button from '@material-ui/core/Button';


const QuestionEditorBody = ({ body, onChange }: any) => {
  const image = useRef<any>();
  const editor = useRef<any>();
  const url = useRef<any>();
  const left = useRef<any>();
  const right = useRef<any>();
  const center = useRef<any>();
  const linkInput = useRef<any>();

  const handleImageClick = (e: any) => {
    image.current.click();
  }

  const handleMakeBold = (e: any) => {
    document.execCommand('bold', false, '');
  }

  const handleMakeItalic = (e: any) => {
    document.execCommand('italic', false, '');
  }

  const handleMakeLink = (e: any) => {
    const classList = linkInput.current.classList;

    if (classList[0] === 'd-none' || classList[1] === 'd-none' || classList[2] === 'd-none') {
      linkInput.current.classList.remove('d-none');
      url.current.focus();
    } else {
      linkInput.current.classList.add('d-none');
    }
  }

  const getImage = (e: any) => {
    const file = e.currentTarget.files[0];
    let reader = new FileReader();
    let dataURI;
  
    reader.addEventListener(
      "load",
      function() {
        dataURI = reader.result;
  
        const img = document.createElement("img");
        img.src = dataURI as string;
        (editor.current as HTMLDivElement).appendChild(img);
      },
      false
    );
  
    if (file) {
      console.log("s");
      reader.readAsDataURL(file);
    }
  }

  const handleUnderlineClick = (e: any) => {
    document.execCommand('underline', false, '');
  }

  const handleStrikethroughClick = (e: any) => {
    document.execCommand('strikeThrough',false,'');
  }

  const handleAlignLeftClick = (e: any) => {
    document.execCommand('justifyLeft',false,'');
    center.current.classList.remove('format-tools');
    right.current.classList.remove('format-tools');
  }

  const handleAlignCenterClick = (e: any) => {
    document.execCommand('justifyCenter',false,'');
    left.current.classList.remove('format-tools');
    right.current.classList.remove('format-tools');

  }

  const handleAlignRightClick = (e: any) => {
    document.execCommand('justifyRight',false,'');
    center.current.classList.remove('format-tools');
    left.current.classList.remove('format-tools');
  }

  const toggleSelect = (e: any) => {
    const classList = e.currentTarget.classList;

    if (classList[0] === 'format-tools' || classList[1] === 'format-tools' || classList[2] === 'format-tools') {
      classList.remove('format-tools');
    } else {
      classList.add('format-tools');
    }
  }

  const handleOkLink = (e: any) => {
    const link = url.current.value as string

    if (link) {
      url.current.value = '';
      linkInput.current.classList.add('d-none');
      editor.current.focus();
      document.execCommand("createLink", false, link);
    }
  }

  const handleCancelLink = (e: any) => {
    linkInput.current.classList.add('d-none');
  }
  
  return (
    <>
      <Row className='d-flex mx-auto mt-0'>
        <div className='d-flex mt-1'>
          <div className='mr-3 cursor-pointer' onClick={toggleSelect}>
            <FormatBoldIcon onClick={handleMakeBold} color='inherit' />
          </div>
          <div className='mr-3 cursor-pointer' onClick={toggleSelect}>
            <FormatItalicIcon onClick={handleMakeItalic} color='inherit' />
          </div>
          <div className='mr-3 cursor-pointer' onClick={toggleSelect}>
            <FormatUnderlinedIcon onClick={handleUnderlineClick} color='inherit' />
          </div>
          <div className='mr-3 cursor-pointer' onClick={toggleSelect}>
            <StrikethroughSIcon onClick={handleStrikethroughClick} color='inherit' />
          </div>
          <InsertLinkIcon onClick={handleMakeLink} color='inherit' className='mr-2 cursor-pointer'/>
          <ImageIcon color='inherit' className='mr-3 cursor-pointer' onClick={handleImageClick}/>
          <input ref={image} type="file" accept="image/*" id="file" className='d-none' onChange={getImage}></input>
          <div ref={left} className='mr-3 cursor-pointer' onClick={toggleSelect}>
            <FormatAlignLeftIcon onClick={handleAlignLeftClick} color='inherit' />
          </div>
          <div ref={center} className='mr-3 cursor-pointer' onClick={toggleSelect}>
            <FormatAlignCenterIcon onClick={handleAlignCenterClick} color='inherit' />
          </div>
          <div ref={right} className='mr-3 cursor-pointer' onClick={toggleSelect}>
            <FormatAlignRightIcon onClick={handleAlignRightClick} color='inherit' />
          </div>
        </div>
        <div className='body-editor'>
          <div ref={linkInput} className='link-url d-none'>
            <b className='ml-1'>Enter the url:</b> 
            <input ref={url} className='ml-1' type='text' /> 
            <Button onClick={handleCancelLink} className='ml-1' color='secondary' variant='contained' size='small'>
              cancel 
            </Button>
            <Button onClick={handleOkLink} className='ml-1' color='primary' variant='contained' size='small'>
              OK
            </Button>
          </div>
          <div
            ref={editor}
            contentEditable
            className='question-input' 
            id='question-body'>
          </div>
        </div>
      </Row>
    </>
  )
}

export default QuestionEditorBody;