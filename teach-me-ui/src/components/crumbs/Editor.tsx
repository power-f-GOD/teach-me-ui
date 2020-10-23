import React, { useState, createRef } from 'react';

import { fetchMentionsFn } from '../../functions';

import mentionStyles from '../../styles/mentionStyles.module.css';
import 'draft-js-hashtag-plugin/lib/plugin.css';
import 'draft-js-linkify-plugin/lib/plugin.css';

import { EditorState } from 'draft-js';
import Editor from 'draft-js-plugins-editor';
import createMentionPlugin from 'draft-js-mention-plugin';
import createHashtagPlugin from 'draft-js-hashtag-plugin';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import PluginEditor from 'draft-js-plugins-editor';

const positionSuggestions = ({ state, props }: any) => {
  let transform;
  let transition;

  if (state.isActive && props.suggestions.length > 0) {
    transform = 'scaleY(1)';
    transition = 'all 0.25s cubic-bezier(.3,1.2,.2,1)';
  } else if (state.isActive) {
    transform = 'scaleY(0)';
    transition = 'all 0.25s cubic-bezier(.3,1,.2,1)';
  }

  return {
    transform,
    transition
  };
};

const Entry = (props: any) => {
  const {
    mention,
    theme,
    searchValue, // eslint-disable-line
    isFocused, // eslint-disable-line
    ...parentProps
  } = props;
  return (
    <div {...parentProps}>
      <div className={theme.mentionSuggestionsEntryContainer}>
        <div className={theme.mentionSuggestionsEntryContainerLeft}>
          <img
            src={mention.avatar}
            className={theme.mentionSuggestionsEntryAvatar}
            alt='avatar'
            role='presentation'
          />
        </div>

        <div className={theme.mentionSuggestionsEntryContainerRight}>
          <div className={theme.mentionSuggestionsEntryText}>
            {mention.displayname}
          </div>

          <div className={theme.mentionSuggestionsEntryTitle}>
            {mention.name}
          </div>
        </div>
      </div>
    </div>
  );
};

const mentionPlugin = createMentionPlugin({
  mentionPrefix: '@',
  supportWhitespace: true,
  positionSuggestions,
  theme: mentionStyles,
  entityMutability: 'IMMUTABLE'
});

const hashtagPlugin = createHashtagPlugin();
const linkifyPlugin = createLinkifyPlugin();

const editorRef = createRef<PluginEditor>();

const EditorBase: React.FC<any> = (props) => {
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );
  const [suggestions, setSuggestions] = useState([]);


  const onChange = (editorState: EditorState) => {
    setEditorState(editorState);
    props.onUpdate(editorState.getCurrentContent().getPlainText());
  };

  const onSearchChange = ({ value }: any) => {
    setSuggestions([]);
    fetchMentionsFn(value).then((suggestions) => {
      setSuggestions(
        suggestions.map(({ firstname, lastname, username, profile_photo }: any) => ({
          displayname: `${firstname} ${lastname}`,
          name: username,
          avatar: profile_photo
        }))
      );
    });
  };

  const focus = () => {
    editorRef.current?.focus();
  };

  const { MentionSuggestions } = mentionPlugin;
  const plugins = [mentionPlugin, linkifyPlugin, hashtagPlugin];
  return (
    <div
      style={{ height: '150px', cursor: 'text', marginTop: '5px' }}
      onClick={focus}>
      <Editor
        editorState={editorState}
        onChange={onChange}
        plugins={plugins}
        ref={editorRef}
      />
      <MentionSuggestions
        onSearchChange={onSearchChange}
        suggestions={suggestions}
        entryComponent={Entry}
      />
    </div>
  );
};

export default EditorBase;
