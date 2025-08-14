import { StyleSheet, Text, View } from "react-native";

const ErrorDisplay = ({ apiError }) => {
    console.log({apiError})
  if (!apiError) return null;

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{apiError.message}</Text>
      {apiError.errors && (
        <View style={styles.nestedErrors}>
          {apiError.errors.map((err, index) => (
            <Text key={index} style={styles.nestedErrorText}>
              • {err.message}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default ErrorDisplay

const styles=  StyleSheet.create({
     errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#EF5350',
  },
  errorText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 15,
  },
  nestedErrors: {
    marginTop: 8,
    marginLeft: 8,
  },
  nestedErrorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginVertical: 2,
  },
})