import { Language } from '../store/useLanguageStore';

export interface CarDetailTranslations {
  // Page titles
  editCar: string;
  addNewCar: string;
  
  // Section titles
  carInformation: string;
  carPhotos: string;
  
  // Labels
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate: string;
  carType: string;
  seats: string;
  
  // Placeholders
  brandPlaceholder: string;
  modelPlaceholder: string;
  yearPlaceholder: string;
  colorPlaceholder: string;
  licensePlatePlaceholder: string;
  carTypePlaceholder: string;
  seatsPlaceholder: string;
  
  // Buttons
  addPhoto: string;
  takePhoto: string;
  uploading: string;
  updateCar: string;
  addCar: string;
  deleteCar: string;
  cancel: string;
  remove: string;
  delete: string;
  ok: string;
  openSettings: string;
  
  // Messages
  takeFirstPhoto: string;
  uploadingPhoto: string;
  photoHint: string;
  maxPhotosLimit: string;
  pleaseWaitUploading: string;
  photoUploadedSuccess: string;
  photoUploadFailed: string;
  photoDeletedSuccess: string;
  carUpdatedSuccess: string;
  carAddedSuccess: string;
  carDeletedSuccess: string;
  removePhotoConfirm: string;
  deleteCarConfirm: string;
  
  // Errors
  error: string;
  authTokenNotFound: string;
  pleaseLoginAgain: string;
  userDataNotFound: string;
  fillRequiredFields: string;
  failedToLoadCar: string;
  failedToSaveCar: string;
  failedToDeleteCar: string;
  failedToDeletePhoto: string;
  failedToTakePhoto: string;
  failedToUploadImage: string;
  noCarDataReceived: string;
  cannotDeletePhotoMissingPath: string;
  cannotDeleteCarWithoutId: string;
  imageUriNotFound: string;
  imageUploadedNoData: string;
  imageUploadedNoUrl: string;
  
  // Permissions
  permissionRequired: string;
  cameraPermissionRequired: string;
  cameraPermissionMessage: string;
  permissionDenied: string;
  cameraUnavailable: string;
  cameraPermissionDenied: string;
  cameraPermissionRequiredSettings: string;
  cameraError: string;
  failedToOpenCamera: string;
  
  // Misc
  limit: string;
  success: string;
  pleaseWait: string;
}

const en: CarDetailTranslations = {
  // Page titles
  editCar: 'Edit Car',
  addNewCar: 'Add New Car',
  
  // Section titles
  carInformation: 'Car Information',
  carPhotos: 'Car Photos',
  
  // Labels
  brand: 'Brand',
  model: 'Model',
  year: 'Year',
  color: 'Color',
  licensePlate: 'Car Number (License Plate)',
  carType: 'Car Type',
  seats: 'Seats',
  
  // Placeholders
  brandPlaceholder: 'e.g., Toyota',
  modelPlaceholder: 'e.g., Camry',
  yearPlaceholder: 'e.g., 2020',
  colorPlaceholder: 'e.g., Black',
  licensePlatePlaceholder: 'e.g., ABC-1234',
  carTypePlaceholder: 'e.g., Sedan, SUV, Hatchback',
  seatsPlaceholder: 'e.g., 4, 5, 6, 7',
  
  // Buttons
  addPhoto: '+ Add Photo',
  takePhoto: 'Take Photo',
  uploading: 'Uploading...',
  updateCar: 'Update Car',
  addCar: 'Add Car',
  deleteCar: 'Delete Car',
  cancel: 'Cancel',
  remove: 'Remove',
  delete: 'Delete',
  ok: 'OK',
  openSettings: 'Open Settings',
  
  // Messages
  takeFirstPhoto: 'Take your first car photo',
  uploadingPhoto: 'Uploading photo...',
  photoHint: 'You can add up to 6 photos (camera only)',
  maxPhotosLimit: 'You can add maximum 6 car photos.',
  pleaseWaitUploading: 'Another photo is being uploaded.',
  photoUploadedSuccess: 'Car photo uploaded successfully!',
  photoUploadFailed: 'Failed to upload photo. Please try again.',
  photoDeletedSuccess: 'Photo deleted successfully!',
  carUpdatedSuccess: 'Car updated successfully!',
  carAddedSuccess: 'Car added successfully!',
  carDeletedSuccess: 'Car deleted successfully!',
  removePhotoConfirm: 'Are you sure you want to remove this photo?',
  deleteCarConfirm: 'Are you sure you want to delete this car? This action cannot be undone.',
  
  // Errors
  error: 'Error',
  authTokenNotFound: 'Authentication token not found.',
  pleaseLoginAgain: 'Authentication token not found. Please login again.',
  userDataNotFound: 'User data not found. Please login again.',
  fillRequiredFields: 'Please fill in brand, model, and license plate.',
  failedToLoadCar: 'Failed to load car data.',
  failedToSaveCar: 'Failed to save car. Please try again.',
  failedToDeleteCar: 'Failed to delete car. Please try again.',
  failedToDeletePhoto: 'Failed to delete photo. Please try again.',
  failedToTakePhoto: 'Failed to take photo.',
  failedToUploadImage: 'Failed to upload image. Please try again.',
  noCarDataReceived: 'No car data received from server.',
  cannotDeletePhotoMissingPath: 'Cannot delete photo: missing path.',
  cannotDeleteCarWithoutId: 'Cannot delete car without ID.',
  imageUriNotFound: 'Image URI not found.',
  imageUploadedNoData: 'Image uploaded but no data received from server.',
  imageUploadedNoUrl: 'Image uploaded but no URL or path received from server.',
  
  // Permissions
  permissionRequired: 'Permission Required',
  cameraPermissionRequired: 'Camera Permission Required',
  cameraPermissionMessage: 'This app needs access to your camera to take photos for your car pictures.',
  permissionDenied: 'Permission Denied',
  cameraUnavailable: 'Camera is not available on this device.',
  cameraPermissionDenied: 'Camera permission was denied. Please enable it in your device settings.',
  cameraPermissionRequiredSettings: 'Camera permission is required. Please enable it in your device settings, then try again.',
  cameraError: 'Camera Error',
  failedToOpenCamera: 'Failed to open camera. Please try again.',
  
  // Misc
  limit: 'Limit',
  success: 'Success',
  pleaseWait: 'Please wait',
};

const hy: CarDetailTranslations = {
  // Page titles
  editCar: '\u053d\u0574\u0562\u0561\u0563\u0580\u0565\u056c \u0574\u0565\u0584\u0565\u0576\u0561\u0576',
  addNewCar: '\u0531\u057e\u0565\u056c\u0561\u0581\u0576\u0565\u056c \u0576\u0578\u0580 \u0574\u0565\u0584\u0565\u0576\u0561',
  
  // Section titles
  carInformation: '\u0544\u0565\u0584\u0565\u0576\u0561\u0575\u056b \u057f\u0565\u0572\u0565\u056f\u0578\u0582\u0569\u0575\u0578\u0582\u0576',
  carPhotos: '\u0544\u0565\u0584\u0565\u0576\u0561\u0575\u056b \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0576\u0565\u0580',
  
  // Labels
  brand: 'Մակնիշ',
  model: 'Մոդել',
  year: 'Տարի',
  color: 'Գույն',
  licensePlate: 'Համարանիշ',
  carType: 'Թափքային տեսակ',
  seats: 'Նստատեղերի քանակ',
  
  // Placeholders
  brandPlaceholder: '\u0585\u0580. Toyota',
  modelPlaceholder: '\u0585\u0580. Camry',
  yearPlaceholder: '\u0585\u0580. 2020',
  colorPlaceholder: '\u0585\u0580. \u054d\u0587',
  licensePlatePlaceholder: '\u0585\u0580. ABC-1234',
  carTypePlaceholder: '\u0585\u0580. \u054d\u0565\u0564\u0561\u0576, SUV',
  seatsPlaceholder: '\u0585\u0580. 4, 5, 6, 7',
  
  // Buttons
  addPhoto: '+ \u0531\u057e\u0565\u056c\u0561\u0581\u0576\u0565\u056c \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580',
  takePhoto: '\u053c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0565\u056c',
  uploading: '\u0532\u0565\u057c\u0576\u057e\u0578\u0582\u0574 \u0567...',
  updateCar: '\u0539\u0561\u0580\u0574\u0561\u0581\u0576\u0565\u056c \u0574\u0565\u0584\u0565\u0576\u0561\u0576',
  addCar: '\u0531\u057e\u0565\u056c\u0561\u0581\u0576\u0565\u056c \u0574\u0565\u0584\u0565\u0576\u0561',
  deleteCar: '\u054b\u0576\u057b\u0565\u056c \u0574\u0565\u0584\u0565\u0576\u0561\u0576',
  cancel: '\u0549\u0565\u0572\u0561\u0580\u056f\u0565\u056c',
  remove: '\u0540\u0565\u057c\u0561\u0581\u0576\u0565\u056c',
  delete: '\u054b\u0576\u057b\u0565\u056c',
  ok: '\u053c\u0561\u057e',
  openSettings: '\u0532\u0561\u0581\u0565\u056c \u056f\u0561\u0580\u0563\u0561\u057e\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580\u0568',
  
  // Messages
  takeFirstPhoto: '\u053c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0565\u0584 \u0571\u0565\u0580 \u0574\u0565\u0584\u0565\u0576\u0561\u0576',
  uploadingPhoto: '\u053c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0568 \u0562\u0565\u057c\u0576\u057e\u0578\u0582\u0574 \u0567...',
  photoHint: '\u053f\u0561\u0580\u0578\u0572 \u0565\u0584 \u0561\u057e\u0565\u056c\u0561\u0581\u0576\u0565\u056c \u0574\u056b\u0576\u0579\u0587 6 \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580',
  maxPhotosLimit: '\u053f\u0561\u0580\u0578\u0572 \u0565\u0584 \u0561\u057e\u0565\u056c\u0561\u0581\u0576\u0565\u056c \u0561\u057c\u0561\u057e\u0565\u056c\u0561\u0563\u0578\u0582\u0575\u0576\u0568 6 \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580:',
  pleaseWaitUploading: '\u0544\u0565\u056f \u0561\u0575\u056c \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580 \u0567 \u0562\u0565\u057c\u0576\u057e\u0578\u0582\u0574:',
  photoUploadedSuccess: '\u053c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0568 \u0570\u0561\u057b\u0578\u0572\u0578\u0582\u0569\u0575\u0561\u0574\u0562 \u0562\u0565\u057c\u0576\u057e\u0565\u0581!',
  photoUploadFailed: '\u0549\u0570\u0561\u057b\u0578\u0572\u057e\u0565\u0581 \u0562\u0565\u057c\u0576\u0565\u056c \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0568: \u0553\u0578\u0580\u0571\u0565\u0584 \u056f\u0580\u056f\u056b\u0576:',
  photoDeletedSuccess: '\u053c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0568 \u057b\u0576\u057b\u057e\u0565\u0581!',
  carUpdatedSuccess: '\u0544\u0565\u0584\u0565\u0576\u0561\u0576 \u0569\u0561\u0580\u0574\u0561\u0581\u057e\u0565\u0581!',
  carAddedSuccess: '\u0544\u0565\u0584\u0565\u0576\u0561\u0576 \u0561\u057e\u0565\u056c\u0561\u0581\u057e\u0565\u0581!',
  carDeletedSuccess: '\u0544\u0565\u0584\u0565\u0576\u0561\u0576 \u057b\u0576\u057b\u057e\u0565\u0581!',
  removePhotoConfirm: '\u054e\u057d\u057f\u0561\u0570 \u0565\u0584, \u0578\u0580 \u0578\u0582\u0566\u0578\u0582\u0574 \u0565\u0584 \u057b\u0576\u057b\u0565\u056c \u0561\u0575\u057d \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0568?',
  deleteCarConfirm: '\u054e\u057d\u057f\u0561\u0570 \u0565\u0584, \u0578\u0580 \u0578\u0582\u0566\u0578\u0582\u0574 \u0565\u0584 \u057b\u0576\u057b\u0565\u056c \u0561\u0575\u057d \u0574\u0565\u0584\u0565\u0576\u0561\u0576? \u0531\u0575\u057d \u0563\u0578\u0580\u056e\u0578\u0572\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568 \u0570\u0576\u0561\u0580\u0561\u057e\u0578\u0580 \u0579\u0567 \u0570\u0565\u057f \u057e\u0565\u0580\u0561\u0581\u0576\u0565\u056c:',
  
  // Errors
  error: '\u054d\u056d\u0561\u056c',
  authTokenNotFound: '\u0546\u0578\u0582\u0575\u0576\u0561\u056f\u0561\u0576\u0561\u0581\u0574\u0561\u0576 \u057f\u0578\u056f\u0565\u0576\u0568 \u0579\u056b \u0563\u057f\u0576\u057e\u0565\u056c:',
  pleaseLoginAgain: '\u0546\u0578\u0582\u0575\u0576\u0561\u056f\u0561\u0576\u0561\u0581\u0574\u0561\u0576 \u057f\u0578\u056f\u0565\u0576\u0568 \u0579\u056b \u0563\u057f\u0576\u057e\u0565\u056c: \u053f\u0580\u056f\u056b\u0576 \u0574\u0578\u0582\u057f\u0584 \u0563\u0578\u0580\u0565\u0584:',
  userDataNotFound: '\u0555\u0563\u057f\u0561\u0563\u0578\u0580\u056e\u056b \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580\u0568 \u0579\u0565\u0576 \u0563\u057f\u0576\u057e\u0565\u056c: \u053f\u0580\u056f\u056b\u0576 \u0574\u0578\u0582\u057f\u0584 \u0563\u0578\u0580\u0565\u0584:',
  fillRequiredFields: '\u053d\u0576\u0564\u0580\u0578\u0582\u0574 \u0565\u0576\u0584 \u056c\u0580\u0561\u0581\u0576\u0565\u056c \u0561\u057a\u0580\u0561\u0576\u056b\u0577\u0568, \u0574\u0578\u0564\u0565\u056c\u0568 \u0587 \u0570\u0561\u0574\u0561\u0580\u0568:',
  failedToLoadCar: '\u0549\u0570\u0561\u057b\u0578\u0572\u057e\u0565\u0581 \u0562\u0565\u057c\u0576\u0565\u056c \u0574\u0565\u0584\u0565\u0576\u0561\u0575\u056b \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580\u0568:',
  failedToSaveCar: '\u0549\u0570\u0561\u057b\u0578\u0572\u057e\u0565\u0581 \u057a\u0561\u0570\u0565\u056c \u0574\u0565\u0584\u0565\u0576\u0561\u0576: \u0553\u0578\u0580\u0571\u0565\u0584 \u056f\u0580\u056f\u056b\u0576:',
  failedToDeleteCar: '\u0549\u0570\u0561\u057b\u0578\u0572\u057e\u0565\u0581 \u057b\u0576\u057b\u0565\u056c \u0574\u0565\u0584\u0565\u0576\u0561\u0576: \u0553\u0578\u0580\u0571\u0565\u0584 \u056f\u0580\u056f\u056b\u0576:',
  failedToDeletePhoto: '\u0549\u0570\u0561\u057b\u0578\u0572\u057e\u0565\u0581 \u057b\u0576\u057b\u0565\u056c \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0568: \u0553\u0578\u0580\u0571\u0565\u0584 \u056f\u0580\u056f\u056b\u0576:',
  failedToTakePhoto: '\u0549\u0570\u0561\u057b\u0578\u0572\u057e\u0565\u0581 \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0565\u056c:',
  failedToUploadImage: '\u0549\u0570\u0561\u057b\u0578\u0572\u057e\u0565\u0581 \u0562\u0565\u057c\u0576\u0565\u056c \u0576\u056f\u0561\u0580\u0568: \u0553\u0578\u0580\u0571\u0565\u0584 \u056f\u0580\u056f\u056b\u0576:',
  noCarDataReceived: '\u0544\u0565\u0584\u0565\u0576\u0561\u0575\u056b \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580 \u0579\u0565\u0576 \u057d\u057f\u0561\u0581\u057e\u0565\u056c \u057d\u0565\u0580\u057e\u0565\u0580\u056b\u0581:',
  cannotDeletePhotoMissingPath: '\u0540\u0576\u0561\u0580\u0561\u057e\u0578\u0580 \u0579\u0567 \u057b\u0576\u057b\u0565\u056c \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0568: \u0578\u0582\u0572\u056b\u0576 \u0562\u0561\u0581\u0561\u056f\u0561\u0575\u0578\u0582\u0574 \u0567:',
  cannotDeleteCarWithoutId: '\u0540\u0576\u0561\u0580\u0561\u057e\u0578\u0580 \u0579\u0567 \u057b\u0576\u057b\u0565\u056c \u0574\u0565\u0584\u0565\u0576\u0561\u0576 \u0561\u057c\u0561\u0576\u0581 ID-\u056b:',
  imageUriNotFound: '\u0546\u056f\u0561\u0580\u056b URI-\u0576 \u0579\u056b \u0563\u057f\u0576\u057e\u0565\u056c:',
  imageUploadedNoData: '\u0546\u056f\u0561\u0580\u0568 \u0562\u0565\u057c\u0576\u057e\u0565\u056c \u0567, \u0562\u0561\u0575\u0581 \u057f\u057e\u0575\u0561\u056c\u0576\u0565\u0580 \u0579\u0565\u0576 \u057d\u057f\u0561\u0581\u057e\u0565\u056c:',
  imageUploadedNoUrl: '\u0546\u056f\u0561\u0580\u0568 \u0562\u0565\u057c\u0576\u057e\u0565\u056c \u0567, \u0562\u0561\u0575\u0581 URL \u0579\u056b \u057d\u057f\u0561\u0581\u057e\u0565\u056c:',
  
  // Permissions
  permissionRequired: '\u054a\u0561\u0570\u0561\u0576\u057b\u057e\u0578\u0582\u0574 \u0567 \u0569\u0578\u0582\u0575\u056c\u057f\u057e\u0578\u0582\u0569\u0575\u0578\u0582\u0576',
  cameraPermissionRequired: '\u054a\u0561\u0570\u0561\u0576\u057b\u057e\u0578\u0582\u0574 \u0567 \u057f\u0565\u057d\u0561\u056d\u0581\u056b\u056f\u056b \u0569\u0578\u0582\u0575\u056c\u057f\u057e\u0578\u0582\u0569\u0575\u0578\u0582\u0576',
  cameraPermissionMessage: '\u0540\u0561\u057e\u0565\u056c\u057e\u0561\u056e\u056b\u0576 \u0561\u0576\u0570\u0580\u0561\u056a\u0565\u0577\u057f \u0567 \u057f\u0565\u057d\u0561\u056d\u0581\u056b\u056f\u056b \u0570\u0561\u057d\u0561\u0576\u0565\u056c\u056b\u0578\u0582\u0569\u0575\u0578\u0582\u0576 \u0574\u0565\u0584\u0565\u0576\u0561\u0575\u056b \u056c\u0578\u0582\u057d\u0561\u0576\u056f\u0561\u0580\u0576\u0565\u0580\u056b \u0570\u0561\u0574\u0561\u0580:',
  permissionDenied: '\u0539\u0578\u0582\u0575\u056c\u057f\u057e\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568 \u0574\u0565\u0580\u056a\u057e\u0565\u0581',
  cameraUnavailable: '\u054f\u0565\u057d\u0561\u056d\u0581\u056b\u056f\u0568 \u0561\u0576\u0570\u0561\u057d\u0561\u0576\u0565\u056c\u056b \u0567 \u0561\u0575\u057d \u057d\u0561\u0580\u0584\u0578\u0582\u0574:',
  cameraPermissionDenied: '\u054f\u0565\u057d\u0561\u056d\u0581\u056b\u056f\u056b \u0569\u0578\u0582\u0575\u056c\u057f\u057e\u0578\u0582\u0569\u0575\u0578\u0582\u0576\u0568 \u0574\u0565\u0580\u056a\u057e\u0565\u0581: \u0544\u056b\u0561\u0581\u0580\u0565\u0584 \u056f\u0561\u0580\u0563\u0561\u057e\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580\u0578\u0582\u0574:',
  cameraPermissionRequiredSettings: '\u054a\u0561\u0570\u0561\u0576\u057b\u057e\u0578\u0582\u0574 \u0567 \u057f\u0565\u057d\u0561\u056d\u0581\u056b\u056f\u056b \u0569\u0578\u0582\u0575\u056c\u057f\u057e\u0578\u0582\u0569\u0575\u0578\u0582\u0576: \u0544\u056b\u0561\u0581\u0580\u0565\u0584 \u056f\u0561\u0580\u0563\u0561\u057e\u0578\u0580\u0578\u0582\u0574\u0576\u0565\u0580\u0578\u0582\u0574 \u0587 \u0583\u0578\u0580\u0571\u0565\u0584 \u056f\u0580\u056f\u056b\u0576:',
  cameraError: '\u054f\u0565\u057d\u0561\u056d\u0581\u056b\u056f\u056b \u057d\u056d\u0561\u056c',
  failedToOpenCamera: '\u0549\u0570\u0561\u057b\u0578\u0572\u057e\u0565\u0581 \u0562\u0561\u0581\u0565\u056c \u057f\u0565\u057d\u0561\u056d\u0581\u056b\u056f\u0568: \u0553\u0578\u0580\u0571\u0565\u0584 \u056f\u0580\u056f\u056b\u0576:',
  
  // Misc
  limit: '\u054d\u0561\u0570\u0574\u0561\u0576\u0561\u0583\u0561\u056f\u0578\u0582\u0574',
  success: '\u0540\u0561\u057b\u0578\u0572\u0578\u0582\u0569\u0575\u0578\u0582\u0576',
  pleaseWait: '\u053d\u0576\u0564\u0580\u0578\u0582\u0574 \u0565\u0576\u0584 \u057d\u057a\u0561\u057d\u0565\u0584',
};

const ru: CarDetailTranslations = {
  // Page titles
  editCar: '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0430\u0432\u0442\u043e',
  addNewCar: '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043d\u043e\u0432\u043e\u0435 \u0430\u0432\u0442\u043e',
  
  // Section titles
  carInformation: '\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u043e\u0431 \u0430\u0432\u0442\u043e',
  carPhotos: '\u0424\u043e\u0442\u043e \u0430\u0432\u0442\u043e',
  
  // Labels
  brand: '\u041c\u0430\u0440\u043a\u0430',
  model: '\u041c\u043e\u0434\u0435\u043b\u044c',
  year: '\u0413\u043e\u0434',
  color: '\u0426\u0432\u0435\u0442',
  licensePlate: '\u041d\u043e\u043c\u0435\u0440 \u0430\u0432\u0442\u043e (\u0433\u043e\u0441. \u043d\u043e\u043c\u0435\u0440)',
  carType: '\u0422\u0438\u043f \u0430\u0432\u0442\u043e',
  seats: '\u041c\u0435\u0441\u0442',
  
  // Placeholders
  brandPlaceholder: '\u043d\u0430\u043f\u0440., Toyota',
  modelPlaceholder: '\u043d\u0430\u043f\u0440., Camry',
  yearPlaceholder: '\u043d\u0430\u043f\u0440., 2020',
  colorPlaceholder: '\u043d\u0430\u043f\u0440., \u0427\u0435\u0440\u043d\u044b\u0439',
  licensePlatePlaceholder: '\u043d\u0430\u043f\u0440., ABC-1234',
  carTypePlaceholder: '\u043d\u0430\u043f\u0440., \u0421\u0435\u0434\u0430\u043d, SUV, \u0425\u044d\u0442\u0447\u0431\u0435\u043a',
  seatsPlaceholder: '\u043d\u0430\u043f\u0440., 4, 5, 6, 7',
  
  // Buttons
  addPhoto: '+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0444\u043e\u0442\u043e',
  takePhoto: '\u0421\u0434\u0435\u043b\u0430\u0442\u044c \u0444\u043e\u0442\u043e',
  uploading: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...',
  updateCar: '\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0430\u0432\u0442\u043e',
  addCar: '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0430\u0432\u0442\u043e',
  deleteCar: '\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0430\u0432\u0442\u043e',
  cancel: '\u041e\u0442\u043c\u0435\u043d\u0430',
  remove: '\u0423\u0434\u0430\u043b\u0438\u0442\u044c',
  delete: '\u0423\u0434\u0430\u043b\u0438\u0442\u044c',
  ok: '\u041e\u041a',
  openSettings: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438',
  
  // Messages
  takeFirstPhoto: '\u0421\u0434\u0435\u043b\u0430\u0439\u0442\u0435 \u043f\u0435\u0440\u0432\u043e\u0435 \u0444\u043e\u0442\u043e \u0430\u0432\u0442\u043e',
  uploadingPhoto: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0444\u043e\u0442\u043e...',
  photoHint: '\u041c\u043e\u0436\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0434\u043e 6 \u0444\u043e\u0442\u043e (\u0442\u043e\u043b\u044c\u043a\u043e \u043a\u0430\u043c\u0435\u0440\u0430)',
  maxPhotosLimit: '\u041c\u0430\u043a\u0441\u0438\u043c\u0443\u043c 6 \u0444\u043e\u0442\u043e \u0430\u0432\u0442\u043e.',
  pleaseWaitUploading: '\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044f \u0434\u0440\u0443\u0433\u043e\u0435 \u0444\u043e\u0442\u043e.',
  photoUploadedSuccess: '\u0424\u043e\u0442\u043e \u0430\u0432\u0442\u043e \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043e!',
  photoUploadFailed: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0444\u043e\u0442\u043e. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
  photoDeletedSuccess: '\u0424\u043e\u0442\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e!',
  carUpdatedSuccess: '\u0410\u0432\u0442\u043e \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e!',
  carAddedSuccess: '\u0410\u0432\u0442\u043e \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e!',
  carDeletedSuccess: '\u0410\u0432\u0442\u043e \u0443\u0434\u0430\u043b\u0435\u043d\u043e!',
  removePhotoConfirm: '\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u043e \u0444\u043e\u0442\u043e?',
  deleteCarConfirm: '\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u044d\u0442\u043e \u0430\u0432\u0442\u043e? \u042d\u0442\u043e \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043d\u0435\u043b\u044c\u0437\u044f \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c.',
  
  // Errors
  error: '\u041e\u0448\u0438\u0431\u043a\u0430',
  authTokenNotFound: '\u0422\u043e\u043a\u0435\u043d \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d.',
  pleaseLoginAgain: '\u0422\u043e\u043a\u0435\u043d \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u0438 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d. \u0412\u043e\u0439\u0434\u0438\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
  userDataNotFound: '\u0414\u0430\u043d\u043d\u044b\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b. \u0412\u043e\u0439\u0434\u0438\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
  fillRequiredFields: '\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043c\u0430\u0440\u043a\u0443, \u043c\u043e\u0434\u0435\u043b\u044c \u0438 \u043d\u043e\u043c\u0435\u0440 \u0430\u0432\u0442\u043e.',
  failedToLoadCar: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435 \u0430\u0432\u0442\u043e.',
  failedToSaveCar: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0430\u0432\u0442\u043e. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
  failedToDeleteCar: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0430\u0432\u0442\u043e. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
  failedToDeletePhoto: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0444\u043e\u0442\u043e. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
  failedToTakePhoto: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u0434\u0435\u043b\u0430\u0442\u044c \u0444\u043e\u0442\u043e.',
  failedToUploadImage: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
  noCarDataReceived: '\u0414\u0430\u043d\u043d\u044b\u0435 \u0430\u0432\u0442\u043e \u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u044b \u043e\u0442 \u0441\u0435\u0440\u0432\u0435\u0440\u0430.',
  cannotDeletePhotoMissingPath: '\u041d\u0435\u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0444\u043e\u0442\u043e: \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u043f\u0443\u0442\u044c.',
  cannotDeleteCarWithoutId: '\u041d\u0435\u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u0430\u0432\u0442\u043e \u0431\u0435\u0437 ID.',
  imageUriNotFound: 'URI \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d.',
  imageUploadedNoData: '\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043e, \u043d\u043e \u0434\u0430\u043d\u043d\u044b\u0435 \u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u044b.',
  imageUploadedNoUrl: '\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043e, \u043d\u043e URL \u043d\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d.',
  
  // Permissions
  permissionRequired: '\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435',
  cameraPermissionRequired: '\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435 \u043a\u0430\u043c\u0435\u0440\u044b',
  cameraPermissionMessage: '\u041f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044e \u043d\u0443\u0436\u0435\u043d \u0434\u043e\u0441\u0442\u0443\u043f \u043a \u043a\u0430\u043c\u0435\u0440\u0435 \u0434\u043b\u044f \u0444\u043e\u0442\u043e \u0430\u0432\u0442\u043e.',
  permissionDenied: '\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435 \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043e',
  cameraUnavailable: '\u041a\u0430\u043c\u0435\u0440\u0430 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u043d\u0430 \u044d\u0442\u043e\u043c \u0443\u0441\u0442\u0440\u043e\u0439\u0441\u0442\u0432\u0435.',
  cameraPermissionDenied: '\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435 \u043a\u0430\u043c\u0435\u0440\u044b \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u043e. \u0412\u043a\u043b\u044e\u0447\u0438\u0442\u0435 \u0432 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430\u0445.',
  cameraPermissionRequiredSettings: '\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0438\u0435 \u043a\u0430\u043c\u0435\u0440\u044b. \u0412\u043a\u043b\u044e\u0447\u0438\u0442\u0435 \u0432 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430\u0445 \u0438 \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
  cameraError: '\u041e\u0448\u0438\u0431\u043a\u0430 \u043a\u0430\u043c\u0435\u0440\u044b',
  failedToOpenCamera: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043a\u0430\u043c\u0435\u0440\u0443. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0441\u043d\u043e\u0432\u0430.',
  
  // Misc
  limit: '\u041b\u0438\u043c\u0438\u0442',
  success: '\u0423\u0441\u043f\u0435\u0448\u043d\u043e',
  pleaseWait: '\u041f\u043e\u0434\u043e\u0436\u0434\u0438\u0442\u0435',
};

export const carDetailTranslations: Record<Language, CarDetailTranslations> = {
  en,
  hy,
  ru,
};

export const getCarDetailTranslations = (language: Language): CarDetailTranslations => {
  return carDetailTranslations[language] || carDetailTranslations.en;
};

// Availability Calendar Translations
export interface AvailabilityCalendarTranslations {
  weeklyAvailability: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  legend: string;
}

const availabilityCalendarEn: AvailabilityCalendarTranslations = {
  weeklyAvailability: 'Weekly availability',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
  legend: 'Tap to toggle: green = available, gray = not available',
};

const availabilityCalendarHy: AvailabilityCalendarTranslations = {
  weeklyAvailability: 'Շաբաթական հասանելիություն',
  monday: 'Երկ',
  tuesday: 'Երք',
  wednesday: 'Չոր',
  thursday: 'Հինգ',
  friday: 'Ուրբ',
  saturday: 'Շաբ',
  sunday: 'Կիր',
  legend: 'Թակել փոխելու համար: կանաչ = հասանելի, մոխրագույն = հասանելի չէ',
};

const availabilityCalendarRu: AvailabilityCalendarTranslations = {
  weeklyAvailability: 'Еженедельная доступность',
  monday: 'Пн',
  tuesday: 'Вт',
  wednesday: 'Ср',
  thursday: 'Чт',
  friday: 'Пт',
  saturday: 'Сб',
  sunday: 'Вс',
  legend: 'Нажмите для переключения: зеленый = доступен, серый = недоступен',
};

export const availabilityCalendarTranslations: Record<Language, AvailabilityCalendarTranslations> = {
  en: availabilityCalendarEn,
  hy: availabilityCalendarHy,
  ru: availabilityCalendarRu,
};

export const getAvailabilityCalendarTranslations = (language: Language): AvailabilityCalendarTranslations => {
  return availabilityCalendarTranslations[language] || availabilityCalendarTranslations.en;
};

// Create Edit Availability Screen Translations
export interface CreateEditAvailabilityTranslations {
  // Page titles
  editAvailability: string;
  addAvailability: string;
  back: string;
  
  // Section titles
  date: string;
  status: string;
  summary: string;
  
  // Status labels
  available: string;
  notAvailable: string;
  conditional: string;
  
  // Summary labels
  dateLabel: string;
  statusLabel: string;
  timeSlotsLabel: string;
  selected: string;
  
  // Buttons
  cancel: string;
  save: string;
  saving: string;
  
  // Validation errors
  validationError: string;
  pleaseSelectDate: string;
  pleaseSelectTimeSlot: string;
  cannotSelectPastDates: string;
  
  // Success messages
  success: string;
  availabilityUpdated: string;
  availabilityCreated: string;
  
  // Error messages
  error: string;
  authTokenNotFound: string;
  pleaseLoginAgain: string;
  userDataNotFound: string;
  failedToSaveAvailability: string;
  
  // Time periods
  morning: string;
  afternoon: string;
  evening: string;
  morningWithTime: string;
  afternoonWithTime: string;
  eveningWithTime: string;
  
  // Time slot selector
  selectTimeSlots: string;
  slot: string;
  slots: string;
  selectAll: string;
  clearAll: string;
}

const createEditAvailabilityEn: CreateEditAvailabilityTranslations = {
  editAvailability: 'Edit Availability',
  addAvailability: 'Add Availability',
  back: '← Back',
  date: 'Date',
  status: 'Status',
  summary: 'Summary',
  available: 'Available',
  notAvailable: 'Not Available',
  conditional: 'Conditional',
  dateLabel: 'Date:',
  statusLabel: 'Status:',
  timeSlotsLabel: 'Time Slots:',
  selected: 'selected',
  cancel: 'Cancel',
  save: 'Save',
  saving: 'Saving...',
  validationError: 'Validation Error',
  pleaseSelectDate: 'Please select a date.',
  pleaseSelectTimeSlot: 'Please select at least one time slot.',
  cannotSelectPastDates: 'Cannot select past dates.',
  success: 'Success',
  availabilityUpdated: 'Availability updated successfully!',
  availabilityCreated: 'Availability created successfully!',
  error: 'Error',
  authTokenNotFound: 'Authentication token not found. Please login again.',
  pleaseLoginAgain: 'Authentication token not found. Please login again.',
  userDataNotFound: 'User data not found. Please login again.',
  failedToSaveAvailability: 'Failed to save availability. Please try again.',
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  morningWithTime: 'Morning\n(6-12)',
  afternoonWithTime: 'Afternoon\n(12-18)',
  eveningWithTime: 'Evening\n(18-24)',
  selectTimeSlots: 'Select Time Slots',
  slot: 'slot',
  slots: 'slots',
  selectAll: 'Select All',
  clearAll: 'Clear All',
};

const createEditAvailabilityHy: CreateEditAvailabilityTranslations = {
  editAvailability: 'Խմբագրել հասանելիությունը',
  addAvailability: 'Ավելացնել հասանելիություն',
  back: '← Վերադառնալ',
  date: 'Ամսաթիվ',
  status: 'Կարգավիճակ',
  summary: 'Ամփոփում',
  available: 'Հասանելի',
  notAvailable: 'Հասանելի չէ',
  conditional: 'Պայմանական',
  dateLabel: 'Ամսաթիվ:',
  statusLabel: 'Կարգավիճակ:',
  timeSlotsLabel: 'Ժամանակային ժամանակահատվածներ:',
  selected: 'ընտրված',
  cancel: 'Չեղարկել',
  save: 'Պահպանել',
  saving: 'Պահպանվում է...',
  validationError: 'Վավերացման սխալ',
  pleaseSelectDate: 'Խնդրում ենք ընտրել ամսաթիվ:',
  pleaseSelectTimeSlot: 'Խնդրում ենք ընտրել առնվազն մեկ ժամանակային ժամանակահատված:',
  cannotSelectPastDates: 'Հնարավոր չէ ընտրել անցած ամսաթվերը:',
  success: 'Հաջողություն',
  availabilityUpdated: 'Հասանելիությունը հաջողությամբ թարմացվեց!',
  availabilityCreated: 'Հասանելիությունը հաջողությամբ ստեղծվեց!',
  error: 'Սխալ',
  authTokenNotFound: 'Նույնականացման նշանը չի գտնվել: Խնդրում ենք նորից մուտք գործել:',
  pleaseLoginAgain: 'Նույնականացման նշանը չի գտնվել: Խնդրում ենք նորից մուտք գործել:',
  userDataNotFound: 'Օգտատիրոջ տվյալները չեն գտնվել: Խնդրում ենք նորից մուտք գործել:',
  failedToSaveAvailability: 'Հնարավոր չէ պահպանել հասանելիությունը: Խնդրում ենք կրկին փորձել:',
  morning: 'Առավոտ',
  afternoon: 'Կեսօր',
  evening: 'Երեկո',
  morningWithTime: 'Առավոտ\n(6-12)',
  afternoonWithTime: 'Կեսօր\n(12-18)',
  eveningWithTime: 'Երեկո\n(18-24)',
  selectTimeSlots: 'Ընտրել ժամանակահատվածներ',
  slot: 'ժամանակահատված',
  slots: 'ժամանակահատվածներ',
  selectAll: 'Ընտրել Բոլորը',
  clearAll: 'Մաքրել Բոլորը',
};

const createEditAvailabilityRu: CreateEditAvailabilityTranslations = {
  editAvailability: 'Редактировать доступность',
  addAvailability: 'Добавить доступность',
  back: '← Назад',
  date: 'Дата',
  status: 'Статус',
  summary: 'Сводка',
  available: 'Доступен',
  notAvailable: 'Недоступен',
  conditional: 'Условный',
  dateLabel: 'Дата:',
  statusLabel: 'Статус:',
  timeSlotsLabel: 'Временные слоты:',
  selected: 'выбрано',
  cancel: 'Отмена',
  save: 'Сохранить',
  saving: 'Сохранение...',
  validationError: 'Ошибка валидации',
  pleaseSelectDate: 'Пожалуйста, выберите дату.',
  pleaseSelectTimeSlot: 'Пожалуйста, выберите хотя бы один временной слот.',
  cannotSelectPastDates: 'Нельзя выбирать прошедшие даты.',
  success: 'Успешно',
  availabilityUpdated: 'Доступность успешно обновлена!',
  availabilityCreated: 'Доступность успешно создана!',
  error: 'Ошибка',
  authTokenNotFound: 'Токен авторизации не найден. Войдите снова.',
  pleaseLoginAgain: 'Токен авторизации не найден. Войдите снова.',
  userDataNotFound: 'Данные пользователя не найдены. Войдите снова.',
  failedToSaveAvailability: 'Не удалось сохранить доступность. Попробуйте снова.',
  morning: 'Утро',
  afternoon: 'День',
  evening: 'Вечер',
  morningWithTime: 'Утро\n(6-12)',
  afternoonWithTime: 'День\n(12-18)',
  eveningWithTime: 'Вечер\n(18-24)',
  selectTimeSlots: 'Выбрать Временные Слоты',
  slot: 'слот',
  slots: 'слотов',
  selectAll: 'Выбрать Все',
  clearAll: 'Очистить Все',
};

export const createEditAvailabilityTranslations: Record<Language, CreateEditAvailabilityTranslations> = {
  en: createEditAvailabilityEn,
  hy: createEditAvailabilityHy,
  ru: createEditAvailabilityRu,
};

export const getCreateEditAvailabilityTranslations = (language: Language): CreateEditAvailabilityTranslations => {
  return createEditAvailabilityTranslations[language] || createEditAvailabilityTranslations.en;
};

// Tab Navigator Translations
export interface TabNavigatorTranslations {
  profile: string;
  availability: string;
  orders: string;
  settings: string;
}

const tabNavigatorEn: TabNavigatorTranslations = {
  profile: 'Profile',
  availability: 'Availability',
  orders: 'Orders',
  settings: 'Settings',
};

const tabNavigatorHy: TabNavigatorTranslations = {
  profile: 'Պրոֆիլ',
  availability: 'Հասանելիություն',
  orders: 'Պատվերներ',
  settings: 'Կարգավորումներ',
};

const tabNavigatorRu: TabNavigatorTranslations = {
  profile: 'Профиль',
  availability: 'Доступность',
  orders: 'Заказы',
  settings: 'Настройки',
};

export const tabNavigatorTranslations: Record<Language, TabNavigatorTranslations> = {
  en: tabNavigatorEn,
  hy: tabNavigatorHy,
  ru: tabNavigatorRu,
};

export const getTabNavigatorTranslations = (language: Language): TabNavigatorTranslations => {
  return tabNavigatorTranslations[language] || tabNavigatorTranslations.en;
};

// Availability List Screen Translations
export interface AvailabilityListTranslations {
  // Page title
  myAvailability: string;
  
  // Filters
  filters: string;
  hideFilters: string;
  filterByDate: string;
  selectDate: string;
  clear: string;
  
  // Time slots
  timeSlot: string;
  timeSlots: string;
  
  // Actions
  tapToEdit: string;
  
  // Empty state
  noAvailabilityRecords: string;
  tapToAddAvailability: string;
  
  // Delete confirmation
  deleteAvailability: string;
  deleteAvailabilityConfirm: string;
  cancel: string;
  delete: string;
  
  // Messages
  success: string;
  error: string;
  authTokenNotFound: string;
  availabilityDeletedSuccess: string;
  failedToDeleteAvailability: string;
}

const availabilityListEn: AvailabilityListTranslations = {
  myAvailability: 'My Availability',
  filters: 'Filters',
  hideFilters: 'Hide Filters',
  filterByDate: 'Filter by Date:',
  selectDate: 'Select Date',
  clear: 'Clear',
  timeSlot: 'time slot',
  timeSlots: 'time slots',
  tapToEdit: 'Tap to edit →',
  noAvailabilityRecords: 'No Availability Records',
  tapToAddAvailability: 'Tap the button below to add your availability',
  deleteAvailability: 'Delete Availability',
  deleteAvailabilityConfirm: 'Are you sure you want to delete this availability record?',
  cancel: 'Cancel',
  delete: 'Delete',
  success: 'Success',
  error: 'Error',
  authTokenNotFound: 'Authentication token not found.',
  availabilityDeletedSuccess: 'Availability deleted successfully.',
  failedToDeleteAvailability: 'Failed to delete availability.',
};

const availabilityListHy: AvailabilityListTranslations = {
  myAvailability: 'Իմ Հասանելիությունը',
  filters: 'Ֆիլտրել',
  hideFilters: 'Թաքցնել ֆիլտրերը',
  filterByDate: 'Զտել ըստ Ամսաթվի:',
  selectDate: 'Ընտրել Ամսաթիվ',
  clear: 'Մաքրել',
  timeSlot: 'ժամանակահատված',
  timeSlots: 'ժամանակահատվածներ',
  tapToEdit: 'Սեղմել փոփոխելու համար →',
  noAvailabilityRecords: 'Հասանելիության Գրառումներ Չկան',
  tapToAddAvailability: 'Սեղմեք ստորև գտնվող կոճակը ձեր հասանելիությունը ավելացնելու համար',
  deleteAvailability: 'ՋնՋել Հասանելիությունը',
  deleteAvailabilityConfirm: 'Դուք վստահ եք, որ ցանկանում եք ջնջել այս հասանելիության գրառումը?',
  cancel: 'Չեղարկել',
  delete: 'Ջնջել',
  success: 'Հաջողություն',
  error: 'Սխալ',
  authTokenNotFound: 'Նույնականացման նշանը չի գտնվել:',
  availabilityDeletedSuccess: 'Հասանելիությունը հաջողությամբ ջնջվեց:',
  failedToDeleteAvailability: 'Հնարավոր չէ ջնջել հասանելիությունը:',
};

const availabilityListRu: AvailabilityListTranslations = {
  myAvailability: 'Моя Доступность',
  filters: 'Фильтры',
  hideFilters: 'Скрыть Фильтры',
  filterByDate: 'Фильтр по Дате:',
  selectDate: 'Выбрать Дату',
  clear: 'Очистить',
  timeSlot: 'временной слот',
  timeSlots: 'временных слотов',
  tapToEdit: 'Нажмите для редактирования →',
  noAvailabilityRecords: 'Нет Записей Доступности',
  tapToAddAvailability: 'Нажмите кнопку ниже, чтобы добавить вашу доступность',
  deleteAvailability: 'Удалить Доступность',
  deleteAvailabilityConfirm: 'Вы уверены, что хотите удалить эту запись доступности?',
  cancel: 'Отмена',
  delete: 'Удалить',
  success: 'Успешно',
  error: 'Ошибка',
  authTokenNotFound: 'Токен авторизации не найден.',
  availabilityDeletedSuccess: 'Доступность успешно удалена.',
  failedToDeleteAvailability: 'Не удалось удалить доступность.',
};

export const availabilityListTranslations: Record<Language, AvailabilityListTranslations> = {
  en: availabilityListEn,
  hy: availabilityListHy,
  ru: availabilityListRu,
};

export const getAvailabilityListTranslations = (language: Language): AvailabilityListTranslations => {
  return availabilityListTranslations[language] || availabilityListTranslations.en;
};
