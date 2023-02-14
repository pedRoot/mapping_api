const express = require("express");
const axios = require("axios").create({baseUrl: ''});
const fs = require('fs');

/**
 * Crea instancia de la app
 */
const app = express();

/**
 * Server escuchando por el puerto 8080
 */
app.listen(8080, () => {
    console.log("Server started at port 8080...");
})

/**
 * Routes
 */

/**
 * Ruta para la generacion de un archivo tipo json 
 * por pais con los valores de los indicadores de la lista: listIndicators.
 * 
 * Formato del archivo a generar:
 * 			
 *          {
 *				tickerId ---> indicator
 *				date     ---> Anio 
 *				amount   ---> value
 *			}
 *
 */
app.get("/i", async (req, res) => {

	const country = "VEN";
	let entriesOfIndicators = [];

	// Lista base de indicadores
	//
	const listIndicators = [
		"NGDP_RPCH", 
		"NGDPD",  
		"NGDPDPC",
		"PCPIPCH",
		"PCPIEPCH",
		"BCA",
		"BCA_NGDPD",
		"LUR",
		"pb",
		"d",
		"DirectAbroad",
		"DirectIn",
	];

	// Obtiene los valore anuales por indicador y pais
	//	
	console.time();
	const indicatorsByCountry = await Promise.all(
		listIndicators.map(async indicator => {
			let url = `https://www.imf.org/external/datamapper/api/v1/${indicator}/${country}`;

	
			const getIndicatorByCountry = await axios({
				url,
				method: "get"
			});

		let valuesOfIndicator = getIndicatorByCountry.data.values[indicator][country];

		  
		for (const [year, value] of Object.entries(valuesOfIndicator)) {
			entriesOfIndicators.push({
				tickerId: `${country}${indicator}`,
				date: year,
				amount: value
			});
		}

		return entriesOfIndicators;
		})
	);
	console.timeEnd();

	fs.writeFile ("indicatorsByCountry_VEN.json", JSON.stringify(indicatorsByCountry), function(err) {
		if (err) throw err;
		console.log('file json generated...!!!');
		}
	);

	res.status(200).json( { indicatorsByCountry });
});


app.get("/api/fmi", async (req, res) => {

	const country = "VEN";
	let entriesOfIndicators = [];

	// Lista base de indicadores
	//
	const listIndicators = [
		"NGDP_RPCH", 
		"NGDPD",  
		"NGDPDPC",
		"PCPIPCH",
		"PCPIEPCH",
		"BCA",
		"BCA_NGDPD",
		"LUR",
		"pb",
		"d",
		"DirectAbroad",
		"DirectIn",
	];

	// Obtiene los valore anuales por indicador y pais
	//	
	console.time();
	const indicatorsByCountry = await Promise.all(
		listIndicators.map(async indicator => {
			let url = `https://www.imf.org/external/datamapper/api/v1/${indicator}/${country}`;

	
			const getIndicatorByCountry = await axios({
				url,
				method: "get"
			});

		let valuesOfIndicator = getIndicatorByCountry.data.values[indicator][country];
		  
		for (const [year, value] of Object.entries(valuesOfIndicator)) {
			entriesOfIndicators.push({
				tickerId: `${country}${indicator}`,
				date: year,
				amount: value
			});
		}

		return entriesOfIndicators;
		})
	);
	console.timeEnd();

	var fs = require('fs');

	fs.writeFile ("indicatorsByCountry_VEN.json", JSON.stringify(indicatorsByCountry), function(err) {
		if (err) throw err;
		console.log('file json generated...!!!');
		}
	);


	res.status(200).json( { indicatorsByCountry });
});

/**
 * Genera archivo tipo json con los datos suministrados por un archivo csv proveniente de eia
 * consernientes a la produccion petroleta de Vzla.
 * 
 *          {
 *				tickerId ---> indicator
 *				date     ---> Anio 
 *				amount   ---> value
 *			}
 * 
 */
app.get("/eia", (req, res) => {
	const sourcePathData = './data/eia/';
	const nameFileToProcess = 'Crude_Oil_Production_Venezuela_Monthly.csv';
	const nameFileToGenerate = 'Crude_Oil_Production_Venezuela_Monthly.json';
	const indicatorProductionOil = [];

	const parserMonth = {
		JAN: "01",
		FEB: "02",
		MAR: "03",
		APR: "04",
		MAY: "05",
		JUN: "06",
		JUL: "07",
		AUG: "08",
		SEP: "09",
		OCT: "10",
		NOV: "11",
		DEC: "12",
	}

	try {

		const tickerId = 'VENOILOUT';
		let date = '';
		let amount = 0;

		const allFileContent = fs.readFileSync(`${sourcePathData}${nameFileToProcess}`, 'utf-8');

		indicatorProductionOil.push(allFileContent.split(/\r?\n/).map(line =>  {

			dateMonth = line.split(/[ ,]+/)[0];
			dateYear = line.split(/[ ,]+/)[1];
			amount = parseFloat(line.split(/[ ,]+/)[2]);

			date = `${parserMonth[dateMonth.toUpperCase()]}-${dateYear}`;

			return {
				tickerId,
				date,
				amount
			};
		}));

		const fd = fs.openSync(`${sourcePathData}${nameFileToGenerate}`, 'a')
		fs.writeSync(fd, JSON.stringify(indicatorProductionOil));
		fs.closeSync(fd);


	} catch (error) {
		res.status(500);
	}

	console.log("-eof-", `${sourcePathData}${nameFileToGenerate}`);

	res.status(200);
});

module.exports = app;
