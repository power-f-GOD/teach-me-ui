import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      background: 'inherit'
    },
    statusFeedback: {
      fontSize: '0.9em',
      textAlign: 'center',
      whiteSpace: 'pre-wrap',
      fontWeight: 'bold',
      width: '100%'
    }
  })
);

export default useStyles;
