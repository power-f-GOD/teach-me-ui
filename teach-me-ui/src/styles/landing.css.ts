import { makeStyles, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
  createStyles({
    landingRootGrid: {
      height: 'inherit',
      minHeight: '36em',
      alignSelf: 'center',
      maxHeight: '50em',
      margin: 'auto',
      flexGrow: 1,
      padding: '2.25em 1.5em',
      background: 'rgb(17, 123, 153)'
    },
    landingRootContainer: {
      height: 'inherit',
      minHeight: '100%'
    },
    landingMainGrid: {
      borderRadius: '0.45em',
      boxShadow:
        '0 0.5em 2.5em rgba(0, 0, 0, 0.35), 0 0.5em 5em rgba(0, 0, 0, 0.15)',
      height: '100%',
      overflowX: 'hidden'
    },
    splashSection: {
      backgroundColor: '#0e303f',
      backgroundImage: 'url("/images/educational.png")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '50% 35%',
      backgroundSize: '55% auto',
      color: 'white',
      height: '100%',
      overflowY: 'auto',
      padding: '2em 1em'
    },
    splash: {
      height: '100%',
      maxHeight: '35em',
      minHeight: '30em'
    },
    splashImage: {
      width: '22em',
      minHeight: '15em'
    },
    formSection: {
      background: '#fff',
      minHeight: '100%',
      height: '100%',
      overflowY: 'auto',
      padding: '2em 2.4rem'
    }
  })
);

export default useStyles;
