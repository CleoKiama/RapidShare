import React, { useState, useEffect } from 'react'
import { Line } from 'rc-progress'
import { CancelTransferModel } from './cancelModal.jsx'
import clsx from 'clsx'
import PropTypes from 'prop-types'

export default function TransferProgress({ onNavigateBack }) {
  const [strokeColor, setStrokeColor] = useState('blue')
  const [isCanceled, setIsCanceled] = useState(false)
  const [progress, setProgress] = useState({
    percentageProgress: 0,
    bytesTransferred: 0
  })
  useEffect(() => {
    const listener = (_, progress) => {
      setProgress(() => {
        return {
          percentageProgress: progress.percentageProgress,
          bytesTransferred: progress.bytesTransferred
        }
      })
    }
    window.electron.on("fileProgress", listener)
    return () => window.electron.removeListener("fileProgress", listener)
  }, [])
  useEffect(() => {
    if (isCanceled) {
      const listener = (_, status) => {
        if (!status) throw new Error("status in this case should be false")
        setIsCanceled(false)
        setStrokeColor('blue')
      }
      window.electron.on('transferring', listener)
      return () => {
        window.electron.removeListener('transferring', listener)
      }
    }

  }, [isCanceled])

  const handleCancel = async () => {
    await window.electron.invoke('cancelTransfer')
    setIsCanceled(true)
    setStrokeColor('red')
  }
  //TODO Get the actual DeviceName
  return (
    <div className="w-48">
      {
        isCanceled &&
        <img
          onClick={onNavigateBack}
          src='static://assets/arrow_back.svg'
          alt='navigate back'
        />
      }
      {
        isCanceled ? <p>Transfer Canceled</p> :
          <h5>sending files to deviceName</h5>
      }
      <p
        className={clsx(isCanceled ? 'text-red-700' : 'text-gray-700')}
      >{progress.bytesTransferred}
      </p>
      <Line
        strokeColor={strokeColor}
        strokeWidth={20}
        strokeLinecap='square'
        percent={progress.percentageProgress}
      />
      {
        !isCanceled &&
        <CancelTransferModel onCancel={handleCancel} />
      }
    </div>
  )
}

TransferProgress.propTypes = {
  onNavigateBack: PropTypes.func.isRequired
}

