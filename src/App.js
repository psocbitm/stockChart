import React, { useEffect, useState } from "react";
import Chart from "./Chart";
function App() {
  const [historicalData, setHistoricalData] = useState([]);
  const [historicalDataLoaded, setHistoricalDataLoaded] = useState(false);
  const [predictedData, setPredictedData] = useState([]);
  const [predictedDataLoaded, setPredictedDataLoaded] = useState(false);
  const [finalData, setFinalData] = useState([]);
  const [finalDataLoaded, setFinalDataLoaded] = useState(false);
  const [upperData, setUpperData] = useState([]);
  const [lowerData, setLowerData] = useState([]);
  const fetchData = async () => {
    setHistoricalDataLoaded(false);
    const response = await fetch(
      "https://stormy-hamlet-70329.herokuapp.com/stockreal/WFC/365"
    );
    const jsonData = await response.json();
    jsonData.map((d) => {
      d.date = new Date(Date.parse(d.date));
      d["Adj Close"] = +d["Adj Close"];
      d.open = +d.Open;
      d.high = +d.High;
      d.low = +d.Low;
      d.close = +d.Close;
      d.volume = +d.Volume;

      return d;
    });

    setHistoricalData(jsonData.slice(jsonData.length - 30, jsonData.length));
    setHistoricalDataLoaded(true);
  };

  const fetchSarimaData = async () => {
    setPredictedDataLoaded(false);
    const response = await fetch(
      "https://internstonksapi.herokuapp.com/api/getthirtydaysarima/WFC"
    );

    const jsonData = await response.json();
    jsonData.data.map((d, index) => {
      d.date = new Date(new Date().setDate(new Date().getDate() + index));
    });
    console.log(jsonData);

    setPredictedData(jsonData.data);
    setPredictedDataLoaded(true);
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    fetchSarimaData();
  }, []);

  useEffect(() => {
    if (historicalDataLoaded && predictedDataLoaded) {
      const newFinalData = [...historicalData, ...predictedData];
      setFinalData(newFinalData);
      setFinalDataLoaded(true);
    }
  }, [historicalDataLoaded, predictedDataLoaded]);

  return (
    <div>
      {finalDataLoaded ? <Chart data={finalData} /> : <div>Loading...</div>}
    </div>
  );
}

export default App;
