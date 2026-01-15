import firestore from '@react-native-firebase/firestore';

interface AcceptOrderParams {
  orderId: string;
  driverId: string;
  seats: number;
}

export async function acceptOrder(params: AcceptOrderParams) {
  const { orderId, driverId } = params;
  const docRef = firestore().collection('orders').doc(orderId);
  await docRef.update({
    driverId,
    status: 'accepted',
    updatedAt: Date.now(),
  });
}


