import React,{useState,useEffect} from 'react'
import  {Line} from 'rc-progress'


export default  function TransferProgress () {
    const [progress,setProgress]  = useState({
     percentageProgress : 50,
     bytesTransferred : 0
  })   
     useEffect(()=>{
     const listener  = (eventId,progress) => { 
       setProgress(()=>{
         return {
          percentageProgress : progress.percentageProgress,
          bytesTransferred : progress.bytesTransferred
        }
      })
          }
       window.electron.on("fileProgress",listener) 
        return () => window.electron.removeListener("fileTransfer",listener)  
     },[])
  //TODO Get the actual DeviceName
  return (
    <div  className="w-48">
     <h5>sending files to deviceName</h5>
      <p className="text-gray-700">{progress.bytesTransferred}</p>
    <Line strokeWidth={20} strokeLinecap='square' percent={progress.percentageProgress}   />    
    </div>
  )
}



