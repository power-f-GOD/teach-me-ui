import React, { useRef } from 'react';

const RenderImage = (props: {file: File}) => {
	const { file } = props;
	const img = useRef<any | undefined>();

	let reader = new FileReader();
	reader.onload = (e) => {
		img.current.setAttribute('src', e.target!.result as string);
	}
	reader.readAsDataURL(file);

	return (
		<img
			ref={img} 
			className='img'
			alt={file.name}
			title={file.name}/> 
	)
}

export default RenderImage;
  
  