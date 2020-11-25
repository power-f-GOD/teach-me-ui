import React, { 
	useRef,
	useState,
	useEffect
} from 'react';

import Row from 'react-bootstrap/Row';

import { ClickAwayListener } from '@material-ui/core';

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
		setErrorVisibility(false);
		let value: string = target.value.substring(0,33);
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
		console.log(tags, key);
		
		if ( (key === 8 || key === 46) && e.target.value === '' && tags[0]) {
			let tempTags = [...tags];
			console.log(tempTags);
			
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
							<svg width="14" height="14" viewBox="0 0 14 14" color='#39739d'>
								<path d="M12 3.41L10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7z"></path>
							</svg>
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