import React, { 
	useRef,
	useState,
	useEffect
} from 'react';

import Row from 'react-bootstrap/Row';

import { ClickAwayListener } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const calculateWidth = (str: string) => {
	let pre = document.createElement('pre');
	let div = document.createElement('div');
	let text = document.createTextNode(str);

	pre.appendChild(text);
	div.appendChild(pre);
	div.style.height = 'auto';
	div.style.width = 'auto';
	div.style.whiteSpace = 'nowrap';
	div.style.fontSize = '16';
	div.style.position = 'absolute';
	document.body.appendChild(div);
	div.style.visibility = 'hidden';
	const width = div.clientWidth;
	document.body.removeChild(div);

	return width;
}

const TagEditor = ({ tags, setTags }: any) => {

	const input = useRef<any>();
	const container = useRef<any>();
	const [inputWidth, setInputWidth] = useState<number>(315);
	const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
	const firstTag = tags[0];
	const tagLength = tags.length;

	useEffect(() => {
		if (tagLength >= 1) {
			setInputWidth(9);
		}
	}, [tagLength]);

	useEffect(() => {
		if (!firstTag) {
			setInputWidth(315);
		}
	}, [firstTag]);

	const onChange = ({ currentTarget: target }: any) => {
		let value: string = target.value.substring(0,33);

		setErrorVisibility(false);
		if (tags[0]) {
			setInputWidth(calculateWidth(value) + 9);
		} else {
			setInputWidth(315);
		}
		if (value[value.length -1] === ' ') {
			setTags([...new Set([...tags, ...value.split(' ').filter((val: string) => (
				val !== ' ' && val !== ''
			))])]);
			input.current.value = '';
			if (tags[0]) {
				setInputWidth(9);
			} else {
				setInputWidth(315);
			}
		} else if (value.includes(' ')) {
			let tempTag = [...value.split(' ').filter((val: string) => (
				val !== ' ' && val !== ''
			))];
			let poped = tempTag.pop() as string;

			setTags([...new Set([...tags, ...tempTag])]);
			input.current.value = poped;
			setTimeout(() => {setInputWidth(calculateWidth(poped) + 9)}, 0);
		}
		if (target.value.length >= 33) {
			setErrorVisibility(true);
		}
	}

	const removeTag = (e: any) => {
		e.preventDefault();
		setTags([...tags.filter((tag: string) => tag !== e.currentTarget.previousElementSibling.innerText)]);
	}

	const focus = (e: any) => {
		container.current.classList.add('tag-editor-container-focus');
		input.current.focus();
	}

	const handleKeydown = (e: any) => {
		let key = e.keyCode || e.charCode;
		
		if ( (key === 8 || key === 46) && e.target.value === '' && tags[0]) {
			let tempTags = [...tags];
			let removedTag = tempTags.pop();
			
			setTags([...tempTags]);
			input.current.value = `${removedTag} `
		} 
	}

	const removeFocus = (e: any) => {
		container.current && container.current.classList.remove('tag-editor-container-focus');
	}

	return (
		<>
			<ClickAwayListener onClickAway={removeFocus}>
				<div ref={container} onClick={focus} className='question-input tag-editor-container'>
					{tags.map((tag: string, index: number) => 
						<span className='tag' key={index} >
							<small>{tag}</small>
							<button onClick={removeTag} className='remove-tag' title='remove tag'>
								<CloseIcon fontSize='inherit' />
							</button>
						</span>
					)}
					<input 
						placeholder=' e.g Data, C++, Computer-Science, English' 
						maxLength={33} 
						style={{width: `${inputWidth}px`}}
						onKeyDown={handleKeydown} 
						onChange={onChange} 
						className='tag-input' 
						ref={input}/>
				</div>
			</ClickAwayListener>
			<Row className={`${errorVisibility ? 'd-flex' : 'd-none'} mx-auto mt-0`}>
				<small style={{color: 'red'}}>tag too long, wondering what you're trying to say</small>
			</Row>
		</>
	)
}

export default TagEditor;