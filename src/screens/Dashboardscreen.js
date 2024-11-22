import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import Dialog from 'react-native-dialog';
import tw from 'twrnc';
import axiosinstance from '../api/axiosconfig';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Toast from 'react-native-toast-message';

const DashboardScreen = ({navigation, route}) => {
  const [filter, setFilter] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState();
  const [ticketToEditData, setTicketToEditData] = useState();
  const [ticketID, setTicketID] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isEditingAttendDate, setIsEditingAttendDate] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openstatus, setopenstatus] = useState(null);
  const [openTicket, setopenTicket] = useState([]);
  const [closeTicket, setcloseTicket] = useState([]);
  const [closestatus, setclosestatus] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);

  const {userinfo} = route.params;
  const Role = userinfo.user.role;

  const callTypeOptions = [
    {label: 'Hardware', value: 'Hardware'},
    {label: 'Software', value: 'Software'},
  ];
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTickets();
    setLoading(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // setSelectedTicket(ticket); // Set the selected ticket
  // Open the bottom sheet

  const [visible, setVisible] = useState(false);

  const ShowDialoue = ticketId => {
    setVisible(true);

    setTicketID(ticketId);
  };
  const handleCancel = () => {
    setVisible(false);
    setTicketID(null);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const [newTicket, setNewTicket] = useState({
    department: '',
    call_type: '',
    problem_description: '',
  });

  const fetchTickets = async () => {
    try {
      const response = await axiosinstance.get('/ticket');

      setTickets(response.data.data);
      const filter = response.data.data;
      let opencount = 0;
      let closecount = 0;
      filter.filter(x => {
        if (x.ticket_status == 'open') {
          setopenTicket(x);
          opencount++;
          return;
        }
      });

      filter.filter(x => {
        if (x.ticket_status == 'closed') {
          setcloseTicket(x);
          closecount++;
          return;
        }
      });

      setopenstatus(opencount);
      setclosestatus(closecount);
      setLoading(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLongPress = ticket => {
    setTicketToEdit(ticket);
    setTicketToEditData(ticket);
    setEditModalVisible(true);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async () => {
    try {
      if (
        !(
          newTicket.department &&
          newTicket.call_type &&
          newTicket.problem_description
        )
      ) {
        Alert.alert('Missing Fields', 'Please provide All Required Fields', [
          {
            text: 'Cancel',
            text: 'cancel',
          },
          {
            text: 'OK',
          },
        ]);
        return;
      }

      const response = await axiosinstance.post('/ticket', newTicket);

      showToast();
      setModalVisible(false);
      fetchTickets();
      setNewTicket({
        department: '',
        call_type: '',
        problem_description: '',
      });
    } catch (error) {
      console.log(error);
    }
  };

  const showToast = () => {
    Toast.show({
      type: 'success',
      text2: 'Ticket Created Successfully',
      autoHide: true,
      visibilityTime: 5000,
    });
  };

  const UpdateToast = () => {
    Toast.show({
      type: 'success',
      text2: 'Ticket updated Successfully',
      autoHide: true,
    });
  };

  //  useEffect(()=>{
  //   const open  = tickets.filter((x)=>x.ticket_status == 'open');
  //   setopenstatus(open.length)
  //   const close  = tickets.filter((x)=>x.ticket_status == 'closed');
  //   setclosestatus(close.length)
  //  },[])

  const UpdateTicket = async () => {
    try {
      // Create an object to hold only the fields that need updating
      const updatedFields = {};

      // Only include engineer_name if it exists and is valid
      if (ticketToEdit.engineer_name) {
        updatedFields.engineer_name = ticketToEdit.engineer_name;
      }

      // Only include attend_date if it is valid and should be updated
      if (ticketToEdit.attend_date) {
        updatedFields.attend_date = formatToISO(ticketToEdit.attend_date); // Format to required ISO string
      }

      // Only include close_date if it is valid and should be updated
      if (ticketToEdit.close_date) {
        updatedFields.close_date = formatToISO(ticketToEdit.close_date); // Format to required ISO string
      }

      // Include remarks if they exist
      if (ticketToEdit.close_remark) {
        updatedFields.close_remark = ticketToEdit.close_remark;
      }

      if (ticketToEdit.pending_remark) {
        updatedFields.pending_remark = ticketToEdit.pending_remark;
      }

      // Ensure ticket_status has the correct value
      if (ticketToEdit.ticket_status) {
        const validStatuses = ['closed', 'open']; // Adjust casing as needed
        if (validStatuses.includes(ticketToEdit.ticket_status)) {
          updatedFields.ticket_status = ticketToEdit.ticket_status; // Use as is
        } else {
          console.error('Invalid ticket status:', ticketToEdit.ticket_status);
          return;
        }
      }
      // if ( !updatedFields.close_date || !updatedFields.ticket_status === 'closed') {
      //   Alert.alert('Warning', "Please provide  close Date and ticket_status while closing the ticket");
      //   return;
      // }
      const CloseDate = !updatedFields.close_date;

      const TicketStatus = updatedFields.ticket_status === 'closed';

      // if(TicketStatus && CloseDate){
      //   Alert.alert("Warning", "Please provide a close date when the status is closed.")
      //   return;
      // }

      if (!TicketStatus && !CloseDate) {
        Alert.alert(
          'Warning',
          'Please set the ticket status to closed when a close date is provided.',
        );
        return;
      }

      if (updatedFields.ticket_status === 'closed') {
        if (
          !updatedFields.close_date ||
          !updatedFields.close_remark ||
          !updatedFields.engineer_name
        ) {
          Alert.alert(
            'Warning',
            'Please provide both close date and close remark when status is closed.',
          );
          return;
        }
      } else {
        // If status is not closed
        if (updatedFields.close_date && !updatedFields.close_remark) {
          Alert.alert(
            'Warning',
            'Please provide a close remark when a close date is selected.',
          );
          return;
        }
      }

      const response = await axiosinstance.put(
        `/ticket/${ticketToEdit.id}`,
        updatedFields,
      );
      if (response) {
        UpdateToast();
      }

      setEditModalVisible(false);
      fetchTickets();
    } catch (error) {
      console.log(
        'Error updating ticket:',
        error.response ? error.response.data : error.message,
      );
    }
  };

  const Handledelete = async () => {
    try {
      const response = await axiosinstance.delete(`/ticket/${ticketID}`);

      setVisible(false);
      if (response.status == 200) {
        fetchTickets();
      }
    } catch (error) {
      console.log('Error', error);
    }
  };
  const formatToISO = date => {
    const isoString = new Date(date).toISOString();
    return isoString.substring(0, 16);
  };
  return (
    <>
      {Role === 1 && (
        <View style={tw`flex-1 font-Inter bg-gray-100 gap-4  p-4`}>
          <View style={tw`flex-row items-center justify-between `}>
            <TouchableOpacity
              onPress={() => {
                setFilterVisible(!filterVisible);
              }}>
              <View style={tw`bg-gray-300 p-2 rounded-2xl`}>
                <Image
                  source={require('../assets/filter.png')}
                  style={tw`size-6`}
                />
              </View>
            </TouchableOpacity>

            {
  filterVisible && (
    
    <View style={tw`flex-row items-center gap-4`}>
    <TouchableOpacity onPress={()=>setFilter('all')}>
  <View style={tw`bg-gray-300  p-2  rounded-2xl `}>
  <Text style={tw`text font-bold text-black px-2 py-1`}>All Tickets {tickets.length}</Text>
  </View>
    </TouchableOpacity>
  <TouchableOpacity onPress={()=>setFilter('open')}>
  <View style={tw`bg-gray-300  p-2 rounded-2xl `}>
  <Text style={tw` font-bold text-black px-2 py-1 text-red-400`}>Open {openstatus}</Text>
  </View>
  </TouchableOpacity>
  <TouchableOpacity onPress={()=>setFilter('closed')}>
  <View style={tw`bg-gray-300  p-2 rounded-2xl `}>
  <Text style={tw`font-bold text-green-400 text-black px-2 py-1`}>Close {closestatus}</Text>
  </View>
  </TouchableOpacity>
  </View>
  
  )
}
          </View>
          {/* <Modal
            visible={filterVisible}
            transparent={true}
            animationType="slide">
            <View style={tw`flex-row items-center gap-4 bg-red-300`}>
              <TouchableOpacity onPress={() => setFilter('all')}>
                <View style={tw`bg-gray-300  p-2  rounded-2xl `}>
                  <Text style={tw` font-bold text-black px-2 py-1`}>
                    All Tickets {tickets.length}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilter('open')}>
                <View style={tw`bg-gray-300  p-2 rounded-2xl `}>
                  <Text
                    style={tw` font-bold text-black px-2 py-1 text-red-400`}>
                    Open {openstatus}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilter('closed')}>
                <View style={tw`bg-gray-300  p-2 rounded-2xl `}>
                  <Text
                    style={tw`font-bold text-green-400 text-black px-2 py-1`}>
                    Close {closestatus}
                  </Text>
                </View>
              </TouchableOpacity>
             <TouchableOpacity>

             <View>
              <Text>
                Cross
              </Text>
             </View>
             </TouchableOpacity>
            </View>
          </Modal> */}

          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={tw`bg-white rounded-lg shadow-md w-full`}>
              <View style={tw`flex-row bg-green-700 p-3 rounded-t-lg h-10`}>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-12`}>
                  ID
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Department
                </Text>
                <Text
                  style={tw`text-white flex-1 font-semibold  text-center text-xs  w-28 `}>
                  Problem
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Status
                </Text>
              </View>

              <ScrollView>
                {tickets.length > 0 ? (
                  tickets
                    .filter(
                      ticket =>
                        filter === 'all' ||
                        (filter === 'open' &&
                          ticket.ticket_status === 'open') ||
                        (filter === 'closed' &&
                          ticket.ticket_status === 'closed'),
                    )

                    .map((ticket, index) => (
                      <TouchableOpacity
                        key={ticket.id}
                        onPress={() => handleLongPress(ticket)}>
                        <View
                          style={tw`flex-row py-2 border-b border-gray-300 h-16`}>
                          <Text style={tw`text-gray-800 text-center w-16`}>
                            {ticket.id}
                          </Text>
                          {/* <Text style={tw`text-gray-800 text-center w-28`} >
                    {ticket.engineer_name ?? 'N/A'}
                  </Text> */}
                          <Text style={tw`text-gray-800 text-center w-28`}>
                            {ticket.department ?? 'N/A'}
                          </Text>
                          <Text style={tw`flex-1 text-gray-800 w-12 `}>
                            {ticket.problem_description
                              ? `${ticket.problem_description.split(' ').slice(0, 4).join(' ')}...`
                              : 'N/A'}
                          </Text>
                          <Text
                            style={tw`  text-center w-28  ${ticket.ticket_status === 'open' ? 'text-red-800' : 'text-green-800'}  `}>
                            {ticket.ticket_status ?? 'N/A'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                ) : (
                  <View style={tw``}>
                    <ActivityIndicator size="large" color="#00ff00" />
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>

          <View>
            <Dialog.Container visible={visible}>
              <Dialog.Title>Ticket delete</Dialog.Title>
              <Dialog.Description>
                Do you want to delete this Ticket?
              </Dialog.Description>
              <Dialog.Button label="No" onPress={handleCancel} />
              <Dialog.Button
                label="Yes"
                onPress={() => {
                  Handledelete();
                }}
              />
            </Dialog.Container>
          </View>

          {/* Dialogue Box for Delete and cancel */}

          {/* Floating Action Button */}
          <TouchableOpacity
            style={tw`bg-blue-500 w-16 h-16 items-center justify-center border rounded-full absolute bottom-4 right-4`}
            onPress={() => setModalVisible(true)}>
            <Image
              source={require('../assets/plus.png')}
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>

          {/* Modal for Creating Ticket */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide">
            <View
              style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-6 gap-3 rounded-lg w-11/12 shadow-lg`}>
                <Text style={tw`text-lg text-black font-bold mb-4 text-center`}>
                  Create Ticket
                </Text>

                {/* Input Fields */}
                <TextInput
                  placeholder="Department"
                  value={newTicket.department}
                  onChangeText={text =>
                    setNewTicket({...newTicket, department: text})
                  }
                  style={tw`border bg-gray-200 border-gray-300 text-black p-3 mb-4 rounded-md`}
                />

                {/* Dropdown for Call Type */}
                <RNPickerSelect
                  onValueChange={value =>
                    setNewTicket({...newTicket, call_type: value})
                  }
                  items={callTypeOptions}
                  placeholder={{label: 'Select Call Type...', value: null}} // Placeholder
                  style={{
                    inputIOS: {
                      color: 'black',
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 5,
                      backgroundColor: 'gray',
                    },
                    inputAndroid: {
                      color: 'black',
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 5,
                      backgroundColor: 'gray',
                    },
                  }}
                  value={newTicket.call_type} 
                />

                <TextInput
                  placeholder="Problem"
                  multiline
                  autoComplete=""
                  autoCorrect
                  cursorColor={'gray'}
                  value={newTicket.problem_description}
                  onChangeText={text =>
                    setNewTicket({...newTicket, problem_description: text})
                  }
                  style={tw`border bg-gray-200 text-black border-gray-300 p-3 mb-4 rounded-md`}
                />

                {/* Buttons for Save and Close */}
                <View style={tw`flex-row justify-between`}>
                  <TouchableOpacity
                    style={tw`bg-green-500 p-3 rounded-md flex-1 mr-2`}
                    onPress={handleCreateTicket}>
                    <Text style={tw`text-white text-center font-semibold`}>
                      Create
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`bg-red-500 p-3 rounded-md flex-1 ml-2`}
                    onPress={() => setModalVisible(false)}>
                    <Text style={tw`text-white text-center font-semibold`}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={editModalVisible}
            transparent={true}
            animationType="slide">
            <View
              style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-6 rounded-lg w-11/12 shadow-lg`}>
                <View style={tw`flex-row justify-between items-center mb-4`}>
                  <Text style={tw`text-lg font-bold text-black`}>
                    Full Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsEditing(prev => !prev)}
                    style={tw`bg-blue-500 p-2 rounded-md`}>
                    <Text style={tw`text-white`}>
                      {isEditing ? 'Stop Editing' : 'Edit'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Editable Fields */}
                {isEditing ? (
                  <>
                    {/* Engineer Name Field */}
                    <TextInput
                      placeholder="Engineer name"
                      value={ticketToEdit?.engineer_name}
                      onChangeText={text =>
                        setTicketToEdit({...ticketToEdit, engineer_name: text})
                      }
                      style={tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`}
                    />

                    {/* Attend Date Field */}
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditingAttendDate(true);
                        showDatePicker();
                      }}
                      style={tw`flex flex-row items-center justify-between border border-gray-300 bg-gray-200 p-3 mb-4 rounded-md`}>
                      <Text style={tw`text-black`}>
                        {ticketToEdit?.attend_date
                          ? new Date(
                              ticketToEdit.attend_date,
                            ).toLocaleDateString('en-US')
                          : 'Select Attend Date'}
                      </Text>
                      <Image
                        source={require('../assets/calendar.png')}
                        style={tw`w-6 h-6`}
                      />
                    </TouchableOpacity>

                    {/* Close Date Field */}
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditingAttendDate(false);
                        showDatePicker();
                      }}
                      style={tw`flex flex-row items-center justify-between border border-gray-300 bg-gray-200 p-3 mb-4 rounded-md`}>
                      <Text style={tw`text-black`}>
                        {ticketToEdit?.close_date
                          ? new Date(
                              ticketToEdit?.close_date,
                            ).toLocaleDateString('en-US')
                          : 'Select Closed Date'}
                      </Text>
                      <Image
                        source={require('../assets/calendar.png')}
                        style={tw`w-6 h-6`}
                      />
                    </TouchableOpacity>

                    {/* Close Remark Field */}
                    <TextInput
                      placeholder="Enter Close Remark"
                      value={ticketToEdit?.close_remark}
                      onChangeText={text =>
                        setTicketToEdit({...ticketToEdit, close_remark: text})
                      }
                      style={tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`}
                    />

                    {/* Pending Remark Field */}
                    <TextInput
                      placeholder="Enter Pending Remark"
                      value={ticketToEdit?.pending_remark}
                      onChangeText={text =>
                        setTicketToEdit({...ticketToEdit, pending_remark: text})
                      }
                      style={tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`}
                    />

                    {/* Ticket Status */}
                    <RNPickerSelect
                      value={ticketToEdit?.ticket_status}
                      onValueChange={value =>
                        setTicketToEdit({...ticketToEdit, ticket_status: value})
                      }
                      items={[
                        {label: 'closed', value: 'closed'},
                        {label: 'open', value: 'open'},
                      ]}
                      placeholder={{
                        label: 'Select Ticket Status...',
                        value: null,
                      }} // Placeholder
                      style={{
                        inputIOS: tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`,
                        inputAndroid: tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`,
                      }}
                    />
                  </>
                ) : (
                  // Display Ticket Information when not editing
                  <View style={tw`mb-4 bg-gray-100 p-4 rounded-lg shadow-md`}>
                    <Text style={tw`font-semibold text-black mb-2 text-lg`}>
                      Ticket Information
                    </Text>

                    <View style={tw`flex-row justify-between mb-2`}>
                      <Text style={tw`font-semibold text-black`}>
                        Engineer Name:
                      </Text>
                      <Text style={tw`text-black`}>
                        {ticketToEdit?.engineer_name ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={tw`flex-row justify-between mb-2`}>
                      <Text style={tw`font-semibold text-black`}>
                        Attend Date:
                      </Text>
                      <Text style={tw`text-black`}>
                        {ticketToEdit?.attend_date
                          ? new Date(
                              ticketToEdit.attend_date,
                            ).toLocaleDateString('en-US')
                          : 'N/A'}
                      </Text>
                    </View>

                    <View style={tw`flex-row justify-between mb-2`}>
                      <Text style={tw`font-semibold text-black`}>
                        Close Date:
                      </Text>
                      <Text style={tw`text-black`}>
                        {ticketToEdit?.close_date
                          ? new Date(
                              ticketToEdit.close_date,
                            ).toLocaleDateString('en-US')
                          : 'N/A'}
                      </Text>
                    </View>

                    <View style={tw`flex-row justify-between mb-2`}>
                      <Text style={tw`font-semibold text-black`}>
                        Close Remark:
                      </Text>
                      <Text style={tw`text-black`}>
                        {ticketToEdit?.close_remark ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={tw`flex-row justify-between mb-2`}>
                      <Text style={tw`font-semibold text-black`}>
                        Pending Remark:
                      </Text>
                      <Text style={tw`text-black`}>
                        {ticketToEdit?.pending_remark ?? 'N/A'}
                      </Text>
                    </View>

                    <View style={tw`flex-row justify-between mb-2`}>
                      <Text style={tw`font-semibold text-black`}>
                        Ticket Status:
                      </Text>
                      <Text
                        style={[
                          tw`text-black`,
                          ticketToEdit?.ticket_status === 'closed'
                            ? tw`text-green-600`
                            : tw`text-red-600`,
                        ]}>
                        {ticketToEdit?.ticket_status ?? 'N/A'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={tw`bg-red-500 p-3 rounded-md flex-grow ml-2`}
                      onPress={() => setEditModalVisible(false)}>
                      <Text style={tw`text-white font-semibold text-center`}>
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Buttons for Save and Close */}
                {isEditing && (
                  <View style={tw`flex-row justify-between`}>
                    <TouchableOpacity
                      style={tw`bg-green-500 p-3 rounded-md flex-grow mr-2`}
                      onPress={() => UpdateTicket()}>
                      <Text style={tw`text-white font-semibold text-center`}>
                        Update
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={tw`bg-red-500 p-3 rounded-md flex-grow ml-2`}
                      onPress={() => setEditModalVisible(false)}>
                      <Text style={tw`text-white font-semibold text-center`}>
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </View>
      )}
      {Role === 2 && (
        <View style={tw`flex-1 bg-gray-100 p-4`}>
          <Text style={tw`text-xl font-bold text-black mb-4`}>
            Engineer Dashboard
          </Text>

          <ScrollView
            horizontal
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={tw`bg-white rounded-lg shadow-md w-full`}>
              <View style={tw`flex-row bg-green-700 p-3 rounded-t-lg`}>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-12`}>
                  S.No
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Engineer
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Department
                </Text>
                <Text
                  style={tw`text-white flex-1 font-semibold text-xs  w-28 `}>
                  Problem Details
                </Text>

                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Attend Date
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Close Date
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Close Remark
                </Text>

                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Pending Remark
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Status
                </Text>
              </View>

              <ScrollView>
                {tickets.length > 0 ? (
                  tickets.map((ticket, index) => (
                    <TouchableOpacity
                      key={ticket.id}
                      onPress={() => handleLongPress(ticket)}>
                      <View style={tw`flex-row py-2 border-b border-gray-300`}>
                        <Text style={tw`text-gray-800 text-center w-16`}>
                          {index + 1}
                        </Text>
                        <Text style={tw`text-gray-800 text-center w-28`}>
                          {ticket.engineer_name ?? 'N/A'}
                        </Text>
                        <Text style={tw`text-gray-800 text-center w-28`}>
                          {ticket.department ?? 'N/A'}
                        </Text>
                        <Text style={tw`flex-1 text-gray-800 w-12 `}>
                          {ticket.problem_description
                            ? `${ticket.problem_description.split(' ').slice(0, 4).join(' ')}...`
                            : 'N/A'}
                        </Text>

                        <Text style={tw`text-gray-800 text-center w-28`}>
                          {ticket.attend_date
                            ? new Date(ticket.attend_date)
                                .toISOString()
                                .split('T')[0]
                            : 'N/A'}
                        </Text>
                        <Text style={tw`text-gray-800 text-center w-28`}>
                          {ticket.close_date
                            ? new Date(ticket.close_date)
                                .toISOString()
                                .split('T')[0]
                            : 'N/A'}
                        </Text>
                        <Text style={tw`text-gray-800 text-center w-28`}>
                          {ticket.close_remark ?? 'N/A'}
                        </Text>
                        <Text style={tw`text-gray-800 text-center w-28 `}>
                          {ticket.pending_remark ?? 'N/A'}
                        </Text>

                        <Text
                          style={tw`  text-center w-28  ${ticket.ticket_status === 'open' ? 'text-red-800' : 'text-green-800'}  `}>
                          {ticket.ticket_status ?? 'N/A'}
                        </Text>

                        {/* <TouchableOpacity onPress={()=>{
                      
                      ShowDialoue(ticket.id)
  
                    }}>
                      
                    <Image 
                    source={require('../assets/delete.png')} style={tw `w-6 h-6`}
                    />
                    </TouchableOpacity> */}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={tw``}>
                    <ActivityIndicator size="large" color="#00ff00" />
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Dialogue Box for Delete and cancel */}

          <View>
            <Dialog.Container visible={visible}>
              <Dialog.Title>Ticket delete</Dialog.Title>
              <Dialog.Description>
                Do you want to delete this Ticket?
              </Dialog.Description>
              <Dialog.Button label="No" onPress={handleCancel} />
              <Dialog.Button
                label="Yes"
                onPress={() => {
                  Handledelete();
                }}
              />
            </Dialog.Container>
          </View>

          {/* Dialogue Box for Delete and cancel */}

          {/* Floating Action Button */}
          <TouchableOpacity
            style={tw`bg-blue-500 w-16 h-16 items-center justify-center border rounded-full absolute bottom-4 right-4`}
            onPress={() => setModalVisible(true)}>
            <Image
              source={require('../assets/plus.png')}
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>

          {/* Modal for Creating Ticket */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide">
            <View
              style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-6 gap-3 rounded-lg w-11/12 shadow-lg`}>
                <Text style={tw`text-lg text-black font-bold mb-4 text-center`}>
                  Create Ticket
                </Text>

                {/* Input Fields */}
                <TextInput
                  placeholder="Department"
                  value={newTicket.department}
                  onChangeText={text =>
                    setNewTicket({...newTicket, department: text})
                  }
                  style={tw`border bg-gray-200 border-gray-300 text-black p-3 mb-4 rounded-md`}
                />

                {/* Dropdown for Call Type */}
                <RNPickerSelect
                  onValueChange={value =>
                    setNewTicket({...newTicket, call_type: value})
                  }
                  items={callTypeOptions}
                  placeholder={{label: 'Select Call Type...', value: null}} // Placeholder
                  style={{
                    inputIOS: {
                      color: 'black',
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 5,
                      backgroundColor: 'gray',
                    },
                    inputAndroid: {
                      color: 'black',
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 5,
                      backgroundColor: 'gray',
                    },
                  }}
                  value={newTicket.call_type} // Bind to state
                />

                <TextInput
                  placeholder="Problem"
                  multiline
                  autoComplete=""
                  autoCorrect
                  cursorColor={'gray'}
                  value={newTicket.problem_description}
                  onChangeText={text =>
                    setNewTicket({...newTicket, problem_description: text})
                  }
                  style={tw`border bg-gray-200 text-black border-gray-300 p-3 mb-4 rounded-md`}
                />

                {/* Buttons for Save and Close */}
                <View style={tw`flex-row justify-between`}>
                  <TouchableOpacity
                    style={tw`bg-green-500 p-3 rounded-md flex-1 mr-2`}
                    onPress={handleCreateTicket}>
                    <Text style={tw`text-white text-center font-semibold`}>
                      Create
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`bg-red-500 p-3 rounded-md flex-1 ml-2`}
                    onPress={() => setModalVisible(false)}>
                    <Text style={tw`text-white text-center font-semibold`}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={editModalVisible}
            transparent={true}
            animationType="slide">
            <View
              style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-6 rounded-lg w-11/12 shadow-lg`}>
                <Text style={tw`text-lg font-bold mb-4 text-center text-black`}>
                  Full Details
                </Text>

                {/* Engineer Name Field */}
                <Text style={tw`font-semibold text-black mb-1`}>
                  Engineer Name
                </Text>
                <TextInput
                  placeholder="Engineer name"
                  value={ticketToEdit?.engineer_name}
                  onChangeText={text =>
                    setTicketToEdit({...ticketToEdit, engineer_name: text})
                  }
                  style={tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`}
                />

                {/* Attend Date Field */}
                <Text style={tw`font-semibold text-black mb-1`}>
                  Attend Date
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingAttendDate(true);
                    showDatePicker();
                  }}
                  style={tw`flex flex-row items-center justify-between border border-gray-300 bg-gray-200 p-3 mb-4 rounded-md`}>
                  <Text style={tw`text-black`}>
                    {ticketToEdit?.attend_date
                      ? new Date(ticketToEdit.attend_date).toLocaleDateString(
                          'en-US',
                        )
                      : 'Select Attend Date'}
                  </Text>
                  <Image
                    source={require('../assets/calendar.png')}
                    style={tw`size-8`}
                  />
                </TouchableOpacity>

                {/* Close Date Field */}
                <Text style={tw`font-semibold text-black mb-1`}>
                  Close Date
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingAttendDate(false); // Set to false for close date
                    showDatePicker();
                  }}
                  style={tw`flex flex-row items-center justify-between border border-gray-300 bg-gray-200 p-3 mb-4 rounded-md`}>
                  <Text style={tw`text-black`}>
                    {ticketToEdit?.close_date
                      ? new Date(ticketToEdit?.close_date).toLocaleDateString(
                          'en-US',
                        )
                      : 'Select Closed Date'}
                  </Text>
                  <Image
                    source={require('../assets/calendar.png')}
                    style={tw`size-8`}
                  />
                </TouchableOpacity>

                {/* Date Picker */}
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={date => {
                    const formattedDate = formatToISO(date); // Format date before setting
                    if (isEditingAttendDate) {
                      setTicketToEdit({
                        ...ticketToEdit,
                        attend_date: formattedDate,
                      }); // Update attend_date
                    } else {
                      setTicketToEdit({
                        ...ticketToEdit,
                        close_date: formattedDate,
                      }); // Update close_date
                    }
                    hideDatePicker();
                  }}
                  onCancel={hideDatePicker}
                />

                {/* Close Remark Field */}
                <Text style={tw`text-black font-semibold mb-1`}>
                  Close Remark
                </Text>
                <TextInput
                  placeholder="Enter Close Remark"
                  value={ticketToEdit?.close_remark}
                  onChangeText={text =>
                    setTicketToEdit({...ticketToEdit, close_remark: text})
                  }
                  style={tw`border  border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`}
                />

                {/* Pending Remark Field */}
                <Text style={tw`text-black font-semibold mb-1`}>
                  Pending Remark
                </Text>
                <TextInput
                  placeholder="Enter Pending Remark"
                  value={ticketToEdit?.pending_remark}
                  onChangeText={text =>
                    setTicketToEdit({...ticketToEdit, pending_remark: text})
                  }
                  style={tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`}
                />

                {/* Ticket Status */}
                <Text style={tw`font-semibold mb-1 text-black`}>
                  Ticket Status
                </Text>
                <RNPickerSelect
                  value={ticketToEdit?.ticket_status}
                  onValueChange={value =>
                    setTicketToEdit({...ticketToEdit, ticket_status: value})
                  }
                  items={[
                    {label: 'closed', value: 'closed'},
                    {label: 'open', value: 'open'},
                  ]}
                  placeholder={{label: 'Select Ticket Status...', value: null}} // Placeholder
                  style={{
                    inputIOS: tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`,
                    inputAndroid: tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`,
                  }}
                />

                {/* Buttons for Save and Close */}
                <View style={tw`flex-row justify-between`}>
                  <TouchableOpacity
                    style={tw`bg-green-500 p-3 rounded-md flex-grow mr-2`}
                    onPress={UpdateTicket}>
                    <Text style={tw`text-white font-semibold text-center`}>
                      Update
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`bg-red-500 p-3 rounded-md flex-grow ml-2`}
                    onPress={() => setEditModalVisible(false)}>
                    <Text style={tw`text-white font-semibold text-center`}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}

      {Role === 3 && (
        <View style={tw`flex-1 bg-gray-100 p-4`}>
          <Text style={tw`text-xl font-bold text-black mb-4`}>
            User Dashboard
          </Text>

          <ScrollView
            horizontal
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={tw`bg-white rounded-lg shadow-md w-full`}>
              <View style={tw`flex-row bg-green-700 p-3 rounded-t-lg`}>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-12`}>
                  S.No
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Engineer
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Department
                </Text>
                <Text
                  style={tw`text-white flex-1 font-semibold text-xs  w-28 `}>
                  Problem Details
                </Text>

                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Attend Date
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Close Date
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Close Remark
                </Text>

                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Pending Remark
                </Text>
                <Text
                  style={tw`text-white font-semibold text-xs text-center w-28`}>
                  Status
                </Text>
              </View>

              <ScrollView>
                {tickets.length > 0 ? (
                  tickets.map((ticket, index) => (
                    <TouchableOpacity
                      key={ticket.id}
                      onPress={() => handleLongPress(ticket)}>
                      <View style={tw`flex-row py-2 border-b border-gray-300`}>
                        <Text style={tw`text-gray-800 text-center w-16`}>
                          {index + 1}
                        </Text>
                        <Text style={tw`text-gray-800 text-center w-28`}>
                          {ticket.engineer_name ?? 'N/A'}
                        </Text>
                        <Text style={tw`text-gray-800 text-center w-28`}>
                          {ticket.department ?? 'N/A'}
                        </Text>
                        <Text style={tw`flex-1 text-gray-800 w-12 `}>
                          {ticket.problem_description
                            ? `${ticket.problem_description.split(' ').slice(0, 4).join(' ')}...`
                            : 'N/A'}
                        </Text>

                        <Text style={tw`text-gray-800 text-center w-28`}>
                          {ticket.attend_date
                            ? new Date(ticket.attend_date)
                                .toISOString()
                                .split('T')[0]
                            : 'N/A'}
                        </Text>
                        <Text style={tw`text-gray-800 text-center w-28`}>
                          {ticket.close_date
                            ? new Date(ticket.close_date)
                                .toISOString()
                                .split('T')[0]
                            : 'N/A'}
                        </Text>
                        <Text style={tw`text-gray-800 text-center w-28`}>
                          {ticket.close_remark ?? 'N/A'}
                        </Text>
                        <Text style={tw`text-gray-800 text-center w-28 `}>
                          {ticket.pending_remark ?? 'N/A'}
                        </Text>

                        <Text
                          style={tw`  text-center w-28  ${ticket.ticket_status === 'open' ? 'text-red-800' : 'text-green-800'}  `}>
                          {ticket.ticket_status ?? 'N/A'}
                        </Text>

                        <TouchableOpacity
                          onPress={() => {
                            // Handledelete(ticket.id)
                            ShowDialoue(ticket.id);
                          }}>
                          <Image
                            source={require('../assets/delete.png')}
                            style={tw`w-6 h-6`}
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={tw``}>
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text style={tw`mt-4 text-2xl text-red-700`}>
                      Loading tickets...
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Dialogue Box for Delete and cancel */}

          <View>
            <Dialog.Container visible={visible}>
              <Dialog.Title>Ticket delete</Dialog.Title>
              <Dialog.Description>
                Do you want to delete this Ticket?
              </Dialog.Description>
              <Dialog.Button label="No" onPress={handleCancel} />
              <Dialog.Button
                label="Yes"
                onPress={() => {
                  Handledelete();
                }}
              />
            </Dialog.Container>
          </View>

          {/* Dialogue Box for Delete and cancel */}

          {/* Floating Action Button */}
          <TouchableOpacity
            style={tw`bg-blue-500 w-16 h-16 items-center justify-center border rounded-full absolute bottom-4 right-4`}
            onPress={() => setModalVisible(true)}>
            <Image
              source={require('../assets/plus.png')}
              style={{width: 24, height: 24}}
            />
          </TouchableOpacity>

          {/* Modal for Creating Ticket */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide">
            <View
              style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-6 gap-3 rounded-lg w-11/12 shadow-lg`}>
                <Text style={tw`text-lg text-black font-bold mb-4 text-center`}>
                  Create Ticket
                </Text>

                {/* Input Fields */}
                <TextInput
                  placeholder="Department"
                  value={newTicket.department}
                  onChangeText={text =>
                    setNewTicket({...newTicket, department: text})
                  }
                  style={tw`border bg-gray-200 border-gray-300 text-black p-3 mb-4 rounded-md`}
                />

                {/* Dropdown for Call Type */}
                <RNPickerSelect
                  onValueChange={value =>
                    setNewTicket({...newTicket, call_type: value})
                  }
                  items={callTypeOptions}
                  placeholder={{label: 'Select Call Type...', value: null}} // Placeholder
                  style={{
                    inputIOS: {
                      color: 'black',
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 5,
                      backgroundColor: 'gray',
                    },
                    inputAndroid: {
                      color: 'black',
                      paddingVertical: 12,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 5,
                      backgroundColor: 'gray',
                    },
                  }}
                  value={newTicket.call_type} // Bind to state
                />

                <TextInput
                  placeholder="Problem"
                  multiline
                  autoComplete=""
                  autoCorrect
                  cursorColor={'gray'}
                  value={newTicket.problem_description}
                  onChangeText={text =>
                    setNewTicket({...newTicket, problem_description: text})
                  }
                  style={tw`border bg-gray-200 text-black border-gray-300 p-3 mb-4 rounded-md`}
                />

                <View style={tw`flex-row justify-between`}>
                  <TouchableOpacity
                    style={tw`bg-green-500 p-3 rounded-md flex-1 mr-2`}
                    onPress={handleCreateTicket}>
                    <Text style={tw`text-white text-center font-semibold`}>
                      Create
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`bg-red-500 p-3 rounded-md flex-1 ml-2`}
                    onPress={() => setModalVisible(false)}>
                    <Text style={tw`text-white text-center font-semibold`}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={editModalVisible}
            transparent={true}
            animationType="slide">
            <View
              style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white p-6 rounded-lg w-11/12 shadow-lg`}>
                <Text style={tw`text-lg font-bold mb-4 text-center text-black`}>
                  Full Details
                </Text>

                {/* Engineer Name Field */}
                <Text style={tw`font-semibold text-black mb-1`}>
                  Engineer Name
                </Text>
                <TextInput
                  placeholder="Engineer name"
                  value={ticketToEdit?.engineer_name}
                  onChangeText={text =>
                    setTicketToEdit({...ticketToEdit, engineer_name: text})
                  }
                  style={tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`}
                />

                {/* Attend Date Field */}
                <Text style={tw`font-semibold text-black mb-1`}>
                  Attend Date
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingAttendDate(true);
                    showDatePicker();
                  }}
                  style={tw`flex flex-row items-center justify-between border border-gray-300 bg-gray-200 p-3 mb-4 rounded-md`}>
                  <Text style={tw`text-black`}>
                    {ticketToEdit?.attend_date
                      ? new Date(ticketToEdit.attend_date).toLocaleDateString(
                          'en-US',
                        )
                      : 'Select Attend Date'}
                  </Text>
                  <Image
                    source={require('../assets/calendar.png')}
                    style={tw`size-8`}
                  />
                </TouchableOpacity>

                {/* Close Date Field */}
                <Text style={tw`font-semibold text-black mb-1`}>
                  Close Date
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingAttendDate(false); // Set to false for close date
                    showDatePicker();
                  }}
                  style={tw`flex flex-row items-center justify-between border border-gray-300 bg-gray-200 p-3 mb-4 rounded-md`}>
                  <Text style={tw`text-black`}>
                    {ticketToEdit?.close_date
                      ? new Date(ticketToEdit?.close_date).toLocaleDateString(
                          'en-US',
                        )
                      : 'Select Closed Date'}
                  </Text>
                  <Image
                    source={require('../assets/calendar.png')}
                    style={tw`size-8`}
                  />
                </TouchableOpacity>

                {/* Date Picker */}
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={date => {
                    const formattedDate = formatToISO(date); // Format date before setting
                    if (isEditingAttendDate) {
                      setTicketToEdit({
                        ...ticketToEdit,
                        attend_date: formattedDate,
                      }); // Update attend_date
                    } else {
                      setTicketToEdit({
                        ...ticketToEdit,
                        close_date: formattedDate,
                      }); // Update close_date
                    }
                    hideDatePicker();
                  }}
                  onCancel={hideDatePicker}
                />

                {/* Close Remark Field */}
                <Text style={tw`text-black font-semibold mb-1`}>
                  Close Remark
                </Text>
                <TextInput
                  placeholder="Enter Close Remark"
                  value={ticketToEdit?.close_remark}
                  onChangeText={text =>
                    setTicketToEdit({...ticketToEdit, close_remark: text})
                  }
                  style={tw`border  border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`}
                />

                {/* Pending Remark Field */}
                <Text style={tw`text-black font-semibold mb-1`}>
                  Pending Remark
                </Text>
                <TextInput
                  placeholder="Enter Pending Remark"
                  value={ticketToEdit?.pending_remark}
                  onChangeText={text =>
                    setTicketToEdit({...ticketToEdit, pending_remark: text})
                  }
                  style={tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`}
                />

                {/* Ticket Status */}
                <Text style={tw`font-semibold mb-1 text-black`}>
                  Ticket Status
                </Text>
                <RNPickerSelect
                  value={ticketToEdit?.ticket_status}
                  onValueChange={value =>
                    setTicketToEdit({...ticketToEdit, ticket_status: value})
                  }
                  items={[
                    {label: 'closed', value: 'closed'},
                    {label: 'open', value: 'open'},
                  ]}
                  placeholder={{label: 'Select Ticket Status...', value: null}} // Placeholder
                  style={{
                    inputIOS: tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`,
                    inputAndroid: tw`border border-gray-300 bg-gray-200 text-black p-3 mb-4 rounded-md`,
                  }}
                />

                {/* Buttons for Save and Close */}
                <View style={tw`flex-row justify-between`}>
                  <TouchableOpacity
                    style={tw`bg-green-500 p-3 rounded-md flex-grow mr-2`}
                    onPress={UpdateTicket}>
                    <Text style={tw`text-white font-semibold text-center`}>
                      Update
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`bg-red-500 p-3 rounded-md flex-grow ml-2`}
                    onPress={() => setEditModalVisible(false)}>
                    <Text style={tw`text-white font-semibold text-center`}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </>
  );
};

export default DashboardScreen;
