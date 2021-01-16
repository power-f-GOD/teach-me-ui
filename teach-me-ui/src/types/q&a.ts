export interface QuestionEditor {
  question: {
    title: string;
    body: string;
    tags: Array<string>;
  };
  selectedUploads: Array<any>;
  selectedFiles: Array<File>;
  tempSelectedUploads: Array<any>;
  showUploads: boolean;
}

export interface QuestionState {
  err?: boolean;
  status: 'settled' | 'pending' | 'fulfilled';
  data?: Object;
}
