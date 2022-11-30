import Head from 'next/head'
import { useEffect, useState } from 'react'
import { DynamoDBClient, ListTablesCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "us-east-1" });

export default function delays( props ) {
    const [isSSR, setIsSSR] = useState(true);

    useEffect(() => {
        setIsSSR(false);
    }, []);
    return( !isSSR &&  <div><Head>
        <title>Result</title>
        <link type="text/css" rel="stylesheet" href="table.css" />
      </Head>
      <body>
        <div style={{
            marginLeft:"275px",
            marginRight:"auto",
            display:"inline-block",
            boxShadow:"10px 10px 5px #888888",
            border:"1px solid #000000",
            background:"white"}}>
          &nbsp;Flight Delays from {props.origin} to {props.dest} by weather&nbsp;</div>
        <p style={{bottomMargin:"10px"}}>
          <table className="CSS_Table_Example" style={{width:"60%", margin:"auto"}}>
            <tr><td>Clear</td><td>Fog</td><td>Rain</td><td>Snow</td><td>Hail</td><td>Thunder</td><td>Tornado</td></tr>
            <tr>
              <td>{props.clear_avg}</td>
              <td>{props.fog_avg}</td>
              <td>{props.rain_avg}</td>
              <td>{props.snow_avg}</td>
              <td>{props.hail_avg}</td>
              <td>{props.thunder_avg}</td>
              <td>{props.tornado_avg}</td>
            </tr>
          </table>
        </p>
    </body></div>)
}

export async function getServerSideProps({query}) {
  function avgDelay(item, weather) {
    const data = item.Item;
    console.log('data', data);
    const flights = Number(data[weather + "_flights"].S);
    if(flights == 0) return " - ";
    const delays = Number(data[weather + "_delay"].S);
    return (delays/flights).toFixed(1);
  }
  var params = {};
  const command = new ListTablesCommand({});
  var getParams = {
    TableName: 'route_delays',
    Key: { route: { S: query.origin+query.dest} }
  }

  const getCommand = new GetItemCommand(getParams);
  try {
    const results = await client.send(command);
    const tables = results.TableNames.join(':');
    const item = await client.send(getCommand);
    console.log(avgDelay(item, "snow"));
    return {
      props: { origin: query.origin,
               dest: query.dest,
               clear_avg: avgDelay(item, "clear"),
               fog_avg: avgDelay(item, "fog"),
               rain_avg: avgDelay(item, "rain"),
               snow_avg: avgDelay(item, "snow"),
               hail_avg: avgDelay(item, "hail"),
               thunder_avg: avgDelay(item, "thunder"),
               tornado_avg: avgDelay(item, "tornado")
             }
    };
  } catch (err) {
    console.error(err)
    return { props: {} };
  }
  
}