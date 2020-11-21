import { ClickAwayListener } from '@material-ui/core';
import React, { 
	useRef,
	useState,
	useEffect
} from 'react';

import Row from 'react-bootstrap/Row';


const TagEditor = ({ tags, setTags }: any) => {

	const input = useRef<any>();
	const container = useRef<any>();
	const [inputWidth, setInputWidth] = useState<number>(315);
	const [errorVisibility, setErrorVisibility] = useState<boolean>(false);
	const firstTag = tags[0];
	const tagLength = tags.length;

	useEffect(() => {
		if (tagLength <= 1) {
			setInputWidth(12);
		}
	}, [tagLength]);

	useEffect(() => {
		if (!firstTag) {
			setInputWidth(315);
		}
	}, [firstTag]);


	const onChange = ({ target }: any) => {
		if (target.value.length < 33) {
			setErrorVisibility(false);
			console.log(tags[0]);
			if (tags[0]) {
				let div = document.createElement('div');
				let text = document.createTextNode(target.value);
				div.appendChild(text);
				div.style.height = 'auto';
				div.style.width = 'auto';
				div.style.whiteSpace = 'nowrap';
				div.style.fontSize = '16';
				div.style.position = 'absolute';
				document.body.appendChild(div);
				div.style.visibility = 'hidden';
				setInputWidth(div.clientWidth + 10);
				document.body.removeChild(div);
			} else {
				setInputWidth(315);
			}
			if (target.value[target.value.length -1] === ' ') {
				setTags([...new Set([...tags, ...target.value.split(' ').filter((val: string) => (
					val !== ' ' && val !== ''
				))])]);
				input.current.value = '';
				if (tags[0]) {
					setInputWidth(10);
				} else {
					setInputWidth(315);
				}
			}
		} else {
			setErrorVisibility(true);
		}
	}

	const removeTag = (e: any) => {
		e.preventDefault();
		setTags([...tags.filter((tag: string) => tag !== e.currentTarget.previousElementSibling.innerHTML)]);
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
							<svg width="14" height="14" viewBox="0 0 14 14" color='#39739d'>
								<path d="M12 3.41L10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7z"></path>
							</svg>
							</button>
						</span>
					)}
					<input placeholder=' e.g Data, C++, Computer-Science, English' maxLength={33} style={{width: `${inputWidth}px`}}onKeyDown={handleKeydown} onChange={onChange} className='tag-input' ref={input}/>
				</div>
			</ClickAwayListener>
			<Row className={`${errorVisibility ? 'd-flex' : 'd-none'} mx-auto mt-0`}>
				<small style={{color: 'red'}}>tag too long, wondering what you're trying to say</small>
			</Row>
		</>
	)
}

export default TagEditor;