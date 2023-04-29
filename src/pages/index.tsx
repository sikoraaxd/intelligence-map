import { Inter } from 'next/font/google'
import UploadPage from './_upload'
import Graphs from './_chart';
import { useState } from 'react';
import React from 'react';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState([]);
  return (
    <>
      {!loading ?
        (!loaded ? 
          <UploadPage  
            loading={loading}
            setLoading={setLoading} 
            loaded={loaded}
            setLoaded={setLoaded}
            data={data}
            setData={setData} 
          /> 
          :
          <Graphs 
            data={data} 
            setData={setData} 
            loaded={loaded}
            setLoaded={setLoaded}
          />)
        :
        <h1>loading...</h1>
      }
    </>
  )
}
