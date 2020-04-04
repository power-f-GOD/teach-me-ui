import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      background: 'inherit'
    },
    flexBasisHalved: {
      // flexBasis: 'calc(50% - 0.5em)',
      flexGrow: 1,
      minWidth: 'fit-content'
    }
  })
);

export default useStyles;
