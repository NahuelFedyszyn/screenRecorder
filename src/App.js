import { useState } from 'react';
import './App.css';



function App() {

  const [recordDisabled, setRecordDisabled] = useState(false)
  const [stopDisabled, setStopDisabled] = useState(true)
  let recorder, stream;

  function downloadBlob(blob, name = 'video.mp4') {
    //El siguiente metodo es experimental segun MDN, pero funciona en todos los navegadores modernos aparentemente
    const blobUrl = URL.createObjectURL(blob);
  
    // Creamos un anchor para poder hacer la descarga
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
  
    // Click en el anchor tag
    link.dispatchEvent(
      new MouseEvent('click', { 
        bubbles: true, 
        cancelable: true, 
        view: window 
      })
    );
  
    // Quitamos el anchor
    document.body.removeChild(link);
  }


  async function startRecording() {
    try{
      stream = await navigator.mediaDevices.getDisplayMedia(
        {
          video: true,
          //TO-DO
          //Por alguna razon, cuando activamos que se pueda capturar el audio
          // el metodo onstop del recorder (se crea mas abajo) no se llama correctamente,
          // por lo que no se realiza la descarga

          audio:true
        }
      );
      recorder = new MediaRecorder(stream, {mimeType: 'video/webm;codecs=vp8,opus', audioBitsPerSecond : 128000});

      //Esta porcion de codigo añade un event listener para detener el record de audio
      // ya que al dejar de compartir, el audio seguia grabandose y por eso nunca se llamaba al metodo 
      // recorder.onstop()   (Todo un dia para esta solucion de mie***)
      //GRACIAS >> https://stackoverflow.com/questions/61975745/mediarecorder-api-recorder-wont-call-onstop-when-recording-multiple-tracks/61978229#61978229?newreg=d2aeda545b344b8480dd5e3b5eb17bbf

      stream.getTracks().forEach((track) =>
      track.addEventListener("ended", () => {
        stream.getAudioTracks().forEach((audio) => audio.stop());
        if (recorder) recorder.stop();
        recorder = null;
        })
      );

      //-------------------------------- 

      
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = e => {
          console.log("Done")
          const completeBlob = new Blob(chunks, { type: chunks[0].type });
          downloadBlob(completeBlob, "video.mp4");
          setRecordDisabled(false);
      };
      recorder.onerror = (e) => console.log(e)
    
      recorder.start();
    }


    catch(err){
      console.log("Error: " + err)
    }

  }


  function handleRecord(){
    setRecordDisabled(true);
    //setStopDisabled(false);
    startRecording();
  }

  /*function handleStop(){
    setRecordDisabled(false);
    setStopDisabled(true);

    try{
      recorder.stop();
      stream.getVideoTracks()[0].stop();
    }
    catch(err){
      console.log(err)
    }

  }*/


  return (
    <div className="App">
      <div className="btnContainer">
        <button name="record" disabled={recordDisabled} id="record" onClick={handleRecord}>RECORD</button>
        {/*<button name="stop" disabled={stopDisabled} id="stop" onClick={handleStop}>STOP</button>*/} 
      </div>
    </div>
  );
}

export default App;
