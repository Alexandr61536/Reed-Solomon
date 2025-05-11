import './App.css'
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { ReedSolomon } from './ReedSolomonDemo/ReedSolomon';

const theme = createTheme({

});

function App() {
	return (
		<MantineProvider theme={theme}>
			<ReedSolomon/>
		</MantineProvider>
	)
}

export default App
