import React, { useState, useRef } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from './ui/button'
import { X, RotateCcw } from 'lucide-react'

const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspect = 1 }) => {
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const imgRef = useRef(null)

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    )
    setCrop(initialCrop)
    const pixelCrop = convertToPixelCrop(initialCrop, width, height)
    setCompletedCrop(pixelCrop)
  }

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const image = imgRef.current

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = completedCrop.width
    canvas.height = completedCrop.height

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/jpeg', 0.95)
    })
  }

  const handleCrop = async () => {
    const croppedBlob = await getCroppedImg()
    if (croppedBlob) {
      const file = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' })
      onCropComplete(file)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='text-lg font-semibold'>Crop Image</h3>
          <button
            onClick={onCancel}
            className='p-1 hover:bg-gray-100 rounded-full'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='p-4'>
          <div className='max-h-96 overflow-auto'>
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={setCompletedCrop}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                onLoad={onImageLoad}
                alt="Crop preview"
                className='max-w-full h-auto'
              />
            </ReactCrop>
          </div>
        </div>

        <div className='flex items-center justify-end gap-3 p-4 border-t bg-gray-50'>
          <Button
            variant='outline'
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCrop}
            disabled={!completedCrop}
            className='bg-blue-500 hover:bg-blue-600'
          >
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ImageCropper
