import Head from 'next/head'
import { useEffect, useState } from 'react'
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
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
        <tr><td>{props.tables}</td><td>2</td><td>3</td><td>4</td>
          <td>5</td><td>6</td><td>7</td></tr>
        
        </table>
        </p>
    </body></div>)
}

export async function getServerSideProps({query}) {
  var params = {};
  const command = new ListTablesCommand({});
  try {
    const results = await client.send(command);
    const tables = results.TableNames.join(':');
    return {
      props: { origin: query.origin,
               dest: query.dest,
               tables: tables }
    };
  } catch (err) {
    console.error(err)
    return { props: {} };
  }
  
}