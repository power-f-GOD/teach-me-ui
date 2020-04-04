import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    landingRootContainer: {
      padding: '2.5em 1.5em',
      height: '100vh',
      minHeight: '38em',
      maxHeight: '50em'
    },
    landingRootGrid: {
      borderRadius: '0.5em',
      boxShadow: '0 0.5em 2.5em rgba(0, 0, 0, 0.35), 0 0.5em 5em rgba(0, 0, 0, 0.15)',
      height: '100%',
      overflowX: 'hidden'
    },
    splashSection: {
      backgroundColor: '#0e303f',
      backgroundImage: 'url("/images/educational.png")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '22.5em auto',
      color: 'white',
      height: '100%',
      overflowY: 'auto',
      padding: '2em 1em'
    },
    splash: {
      height: '100%'
    },
    splashImage: {
      width: '22em',
      minHeight: '15em'
    },
    formSection: {
      background: '#fff',
      height: '100%',
      overflowY: 'auto',
      padding: '2em 1vw'
    }
  })
);

export default useStyles;
