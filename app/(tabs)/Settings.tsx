import React from 'react'
import { Text, View } from 'react-native'

const Settings = () => {
  return (
    <View
        style= {{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white', // Changed to white for better visibility
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        }} 
    >
      <Text>Settings</Text>
    </View>
  )
}

export default Settings