const UpdateTicket = async () => {
  try {
    // Create an object to hold only the updated fields
    const updatedFields = {};

    // Conditionally add fields with validation for PUT request
    const ticketData = [
      { field: 'engineer_name', value: ticketToEdit.engineer_name },
      { field: 'attend_date', value: ticketToEdit.attend_date }, // Ensure correct format if validation function exists
      { field: 'close_date', value: ticketToEdit.close_date }, // Ensure correct format if validation function exists
      { field: 'close_remark', value: ticketToEdit.close_remark },
      { field: 'pending_remark', value: ticketToEdit.pending_remark },
      { field: 'ticket_status', value: ticketToEdit.ticket_status },
    ];

    for (const item of ticketData) {
      // Check for value and optional validation, exclude unchanged close_date
      if (item.field !== 'close_date' || item.value !== ticketToEdit.close_date) { // Check if value is different from original
        if (item.value && (!item.validate || item.validate(item.value))) {
          updatedFields[item.field] = item.value;
        }
      }
    }

    console.log("updatedFields", updatedFields);

    // Make the PUT request with only updated fields
    const response = await axiosinstance.put(`/ticket/${ticketToEdit.id}`, updatedFields);

    console.log("response", response);

    setEditModalVisible(false);
    fetchTickets();
  } catch (error) {
    console.log("Error updating ticket:", error.response ? error.response.data : error.message);
  }
};