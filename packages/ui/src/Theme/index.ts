import { createTheme } from '@mui/material';

const theme = createTheme({
    defaultColorScheme: 'dark',
    palette: {
        mode: 'dark',
        text: {
            secondary: '#AFAFB1',
        },
    },
    components: {
        MuiListItemText: {
            defaultProps: {
                color: '#AFAFB1',
            },
        },
    },
});

export default theme;
