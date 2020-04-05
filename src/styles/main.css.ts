import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 'auto',
      minHeight: '100vh',
      flexGrow: 1,
      background: 'white'
    }
  })
);

export default useStyles;
