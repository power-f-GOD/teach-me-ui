import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      background: 'inherit'
    },
    flexBasisHalved: {
      flexGrow: 1,
      minWidth: 'fit-content'
    }
  })
);

export default useStyles;
