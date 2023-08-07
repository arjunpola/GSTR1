/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

import './App.css';

let fTotal = 0;
let rTotal = 0;
let mTotal = 0;
let oTotal = 0;

let fCgst = 0;
let rCgst = 0;
let mCgst = 0;
let oCgst = 0;

let fSgst = 0;
let rSgst = 0;
let mSgst = 0;
let oSgst = 0;

let fIgst = 0;
let rIgst = 0;
let mIgst = 0;
let oIgst = 0;

function GetFileUploader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fTotal = 0;
    rTotal = 0;
    mTotal = 0;
    oTotal = 0;

    fCgst = 0;
    rCgst = 0;
    mCgst = 0;
    oCgst = 0;

    fSgst = 0;
    rSgst = 0;
    mSgst = 0;
    oSgst = 0;

    fIgst = 0;
    rIgst = 0;
    mIgst = 0;
    oIgst = 0;
  }, []);

  const extractGstrJson = (gj: any) => {
    const { b2b } = gj;
    const invoices: Map<string, any> = new Map();

    b2b.forEach((i: any) => {
      const gInvoices = i.inv;
      gInvoices.forEach((inv: any) => {
        const { itms } = inv;

        itms.forEach((ie: any) => {
          const id = ie.itm_det;
          if (id.rt === 12) {
            rTotal += id.txval;
            rCgst += Math.round(id.camt);
            rSgst += Math.round(id.samt);
            rIgst += Math.round(id.iamt);
          } else if (id.rt === 5) {
            fTotal += id.txval;
            fCgst += Math.round(id.camt);
            fSgst += Math.round(id.samt);
            fIgst += Math.round(id.iamt);
          } else if (id.rt === 18) {
            mTotal += id.txval;
            mCgst += Math.round(id.camt);
            mSgst += Math.round(id.samt);
            mIgst += Math.round(id.iamt);
          } else {
            oTotal += id.txval;
            oCgst += Math.round(id.camt);
            oSgst += Math.round(id.samt);
            oIgst += Math.round(id.iamt);
          }
        });

        invoices.set(inv.inum.substring(3), {
          items: itms,
        });
      });
    });

    setLoaded(true);
  };

  const onDrop = useCallback((acceptedFiles: any) => {
    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = async () => {
        try {
          const textStr = (reader.result || '') as string;

          const gj = JSON.parse(textStr);
          extractGstrJson(gj);
        } catch (error) {
          console.log(error);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps } = useDropzone({ onDrop });

  return (
    <div className="Container">
      <div
        {...getRootProps()}
        style={{
          borderStyle: 'dotted',
          borderWidth: 1,
          borderColor: 'black',
          borderRadius: 5,
          padding: 48,
        }}
      >
        <p>DROP JSON FILE HERE!</p>
      </div>
      <Link
        to="/results"
        style={{ color: loaded ? 'blue' : 'gray', marginTop: '48px' }}
      >
        Results
      </Link>
    </div>
  );
}

function Results() {
  const toINR = (number: any) => {
    let x = number;
    x = number.toString();
    let afterPoint = '';
    if (x.indexOf('.') > 0) afterPoint = x.substring(x.indexOf('.'), x.length);
    x = Math.floor(x);
    x = x.toString();
    let lastThree = x.substring(x.length - 3);
    const otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== '') lastThree = `,${lastThree}`;
    return (
      `\u20B9` +
      ` ${otherNumbers.replace(
        /\B(?=(\d{2})+(?!\d))/g,
        ','
      )}${lastThree}${afterPoint}`
    );
  };

  return (
    <div className="Container">
      <div>
        <p>Rent Total: {toINR(rTotal)}</p>
        <p>Sgst Total (6%): {toINR(rSgst)}</p>
        <p>Cgst Total (6%): {toINR(rCgst)}</p>
      </div>
      <hr style={{ height: '3px', width: '100%', background: 'black' }} />
      <div>
        <p>Food Total: {toINR(fTotal)}</p>
        <p>Sgst Total (2.5%): {toINR(fSgst)}</p>
        <p>Cgst Total (2.5%): {toINR(fCgst)}</p>
      </div>
      <hr style={{ height: '3px', width: '100%', background: 'black' }} />
      <div>
        <p>Misc Total: {toINR(mTotal)}</p>
        <p>Sgst Total (9%): {toINR(mSgst)}</p>
        <p>Cgst Total (9%): {toINR(mCgst)}</p>
      </div>
      <hr style={{ height: '3px', width: '100%', background: 'black' }} />
      <Link to="/" style={{ color: 'gray' }}>
        Back
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router initialEntries={['/', '/results']} initialIndex={1}>
      <Routes>
        <Route path="/" element={<GetFileUploader />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}
