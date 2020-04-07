import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      background: 'inherit'
    },
    flexBasisHalved: {
      flexGrow: 1,
      minWidth: '45%'
    }
  })
);

export default useStyles;
