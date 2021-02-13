import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

export const processWord = (word: string, i?: number) => {
  switch (true) {
    case /^@[a-z0-9_]+/i.test(word): {
      const pattern = /^(@[a-z0-9_]+[a-z0-9_.]*[a-z0-9_]+)(.*)/i;
      const username = word.replace(pattern, '$1');

      return (
        <Fragment key={i}>
          {' '}
          <Link to={`/${username}`} onClick={(e) => e.stopPropagation()}>
            {username}
          </Link>
          {word.replace(pattern, '$2')}
        </Fragment>
      );
    }
    case /^#[a-z0-9_]+$/i.test(word): {
      const pattern = /^(#[a-z0-9_]+)(.*)/i;
      const hashtag = word.replace(pattern, '$1');

      return (
        <Fragment key={i}>
          {' '}
          <Link
            to={`/search?q=${hashtag.slice(1)}&v=hashtag`}
            onClick={(e) => e.stopPropagation()}>
            {hashtag}
          </Link>
          {hashtag.replace(pattern, '$2')}
        </Fragment>
      );
    }
    case /^(https?:\/\/)?([a-z0-9_-]+\.[a-z0-9_-]+)[^]*[^.]$/.test(word): {
      const { origin } = window.location;

      return (
        <Fragment key={i}>
          {' '}
          <a
            href={
              /https?:/.test(word)
                ? new RegExp(`^${origin}`, 'i').test(word)
                  ? word.replace(origin, '')
                  : word
                : `https://${word}`
            }
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}>
            {word}
          </a>
        </Fragment>
      );
    }
    default:
      return (
        <Fragment key={i}>
          {/^[.,?!"';]/.test(word) ? word : ' ' + word}
        </Fragment>
      );
  }
};

export const formatTextThenProcessWord = (chunk: string, i: number) => {
  switch (true) {
    case /^(\*[^*]+\*)$/.test(chunk):
      return (
        <strong key={i}>
          {chunk
            .replace(/^\*([^*]+)\*$/, '$1')
            .split(/\s/)
            .map(processWord)}
        </strong>
      );
    case /^(_[^_]+_)$/.test(chunk):
      return (
        <em key={i}>
          {chunk
            .replace(/^_([^_]+)_$/, '$1')
            .split(/\s/)
            .map(processWord)}
        </em>
      );
    case /^(`[^`]+`)$/.test(chunk):
      return <code key={i}>{chunk.replace(/^`([^`]+)`$/, '$1')}</code>;
  }

  return chunk.split(/\s/).map(processWord);
};

export const processText = (text: string): any[] => {
  if (!text.trim()) return [text];

  const isCode = /```/.test(text);
  const lines = (isCode ? text.replace(/\r|\n/g, 'K#%#') : text).split(/\r|\n/);
  const indexOfLast = lines.length - 1;

  return lines.map((line, i) => {
    const atLastLine = i === indexOfLast;

    if (
      !/(@|#|(https?:\/\/)?[a-z0-9_]+\.[a-z0-9_]|\*|_|`(``)?)[a-z0-9_]/i.test(
        line
      )
    ) {
      return (
        <Fragment key={i}>
          {line}
          {atLastLine ? null : <br />}
        </Fragment>
      );
    }

    // special case for multiline code
    if (/(```(?!\s)[^```]+(?<!\s)```)/.test(line)) {
      return line.split(/```/).map((_chunk, i) => {
        const chunk = _chunk.replace(/K#%#/g, '\n');

        switch (true) {
          case /^(\s|\n)|(\s|\n)$/.test(chunk):
            return processText(chunk);
          default:
            return <code key={i}>{chunk}</code>;
        }
      });
    }

    return line
      .split(
        /(\*(?!\s)[^*]+(?<!\s)\*|_(?!\s)[^_]+(?<!\s)_|`(?!\s)[^`]+(?<!\s)`|```(?!\s)[^```]+(?<!\s)```)/g
      )
      .map(formatTextThenProcessWord)
      .concat([atLastLine ? <Fragment key={i}></Fragment> : <br key='br' />]);
  });
};
