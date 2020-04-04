import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      background: '#eee',
      height: '100%'
    }
  })
);

export default useStyles;
