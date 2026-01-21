import React, { useState, useEffect } from 'react';
import { FlatList, Text, View, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Button } from '../../components/ui/Button';

const SEEN_ORDERS_KEY = '@seen_orders';

interface Order {
  id: string;
  name: string;
  date: string;
  address: string;
  phoneNumber: string;
}

// Sample orders array
const sampleOrders: Order[] = [
  {
    id: '1',
    name: 'John Doe',
    date: '2024-01-15 10:30 AM',
    address: '123 Main Street, New York, NY 10001',
    phoneNumber: '+1 (555) 123-4567',
  },
  {
    id: '2',
    name: 'Jane Smith',
    date: '2024-01-15 11:15 AM',
    address: '456 Oak Avenue, Los Angeles, CA 90001',
    phoneNumber: '+1 (555) 234-5678',
  },
  {
    id: '3',
    name: 'Michael Johnson',
    date: '2024-01-15 12:00 PM',
    address: '789 Pine Road, Chicago, IL 60601',
    phoneNumber: '+1 (555) 345-6789',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    date: '2024-01-15 1:30 PM',
    address: '321 Elm Street, Houston, TX 77001',
    phoneNumber: '+1 (555) 456-7890',
  },
  {
    id: '5',
    name: 'David Brown',
    date: '2024-01-15 2:45 PM',
    address: '654 Maple Drive, Phoenix, AZ 85001',
    phoneNumber: '+1 (555) 567-8901',
  },
  {
    id: '6',
    name: 'Emily Davis',
    date: '2024-01-15 3:20 PM',
    address: '987 Cedar Lane, Philadelphia, PA 19101',
    phoneNumber: '+1 (555) 678-9012',
  },
];

export const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [seenOrderIds, setSeenOrderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSeenOrders();
  }, []);

  const loadSeenOrders = async () => {
    try {
      const data = await AsyncStorage.getItem(SEEN_ORDERS_KEY);
      if (data) {
        const seenIds = JSON.parse(data) as string[];
        setSeenOrderIds(new Set(seenIds));
      }
    } catch (e) {
      console.error('Error loading seen orders:', e);
    }
  };

  const markOrderAsSeen = async (orderId: string) => {
    try {
      const updatedSeenIds = new Set(seenOrderIds);
      updatedSeenIds.add(orderId);
      setSeenOrderIds(updatedSeenIds);
      await AsyncStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify(Array.from(updatedSeenIds)));
    } catch (e) {
      console.error('Error saving seen orders:', e);
    }
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
    // Mark order as seen when modal is opened
    markOrderAsSeen(order.id);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isSelected = selectedOrder?.id === item.id;
    const isSeen = seenOrderIds.has(item.id);
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleOrderPress(item)}
        style={[
          styles.orderCard,
          isSelected && styles.orderCardSelected,
          isSeen && !isSelected && styles.orderCardSeen,
        ]}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderName}>{item.name}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{item.address}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{item.phoneNumber}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} orders</Text>
      </View>
      
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders available</Text>
          </View>
        }
      />

      {/* Order Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedOrder && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Order Details</Text>
                    <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Customer Information</Text>
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailLabel}>Name:</Text>
                        <Text style={styles.modalDetailValue}>{selectedOrder.name}</Text>
                      </View>
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailLabel}>Phone:</Text>
                        <Text style={styles.modalDetailValue}>{selectedOrder.phoneNumber}</Text>
                      </View>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Order Information</Text>
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailLabel}>Date:</Text>
                        <Text style={styles.modalDetailValue}>{selectedOrder.date}</Text>
                      </View>
                      <View style={styles.modalDetailRow}>
                        <Text style={styles.modalDetailLabel}>Address:</Text>
                        <Text style={styles.modalDetailValue}>{selectedOrder.address}</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              <View style={styles.modalFooter}>
                <Button title="Close" onPress={handleCloseModal} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
    shadowColor: '#38AA35',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  orderCardSelected: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: '#EFF6FF',
    shadowColor: '#38AA35',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  orderCardSeen: {
    borderColor: '#38AA35',
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: '#ECFDF5',
    shadowColor: '#2D882A',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 12,
  },
  orderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalDetailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 8,
  },
  modalDetailLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    width: 100,
  },
  modalDetailValue: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
    fontWeight: '500',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});
