import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, RefreshControl, AsyncStorage } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';
import moment from 'moment';
import { withNavigationFocus } from "react-navigation";

const SpotAPI = require ('../controllers/spot');

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      tableHead: ['', 'Total Weight', 'Spot Price', 'Total Holdings'],
      tableTitle: ['Silver', 'Gold', 'Platinum', 'Palladium'],
      tableData: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ],
      portfolioBalance: null,
      portfolioBalanceLastUpdate: 'Never',
      silver: null,
      silverWeight: null,
      gold: null,
      goldWeight: null,
      platinum: null,
      platinumWeight: null,
      palladium: null,
      palladiumWeight: null
    }
  }

  getLatestPrices() {
    SpotAPI.getPrices()
    .then(response => {
      const prices = response.prices
      this.setState({silver: prices.silver, gold: prices.gold, platinum: prices.platinum, palladium: prices.palladium})
      this.setTableSpotPrices();
      this.setPortfolioBalance();
    });
  }

  getPortfolioWeightsFromStorage() {
    AsyncStorage.getItem("silverWeight").then((value) => {
      this.setState({silverWeight: value});
    }).done();

    AsyncStorage.getItem("goldWeight").then((value) => {
      this.setState({goldWeight: value});
    }).done();

    AsyncStorage.getItem("platinumWeight").then((value) => {
      this.setState({platinumWeight: value});
    }).done();

    AsyncStorage.getItem("palladiumWeight").then((value) => {
      this.setState({palladiumWeight: value});
    }).done();
  }

  setPortfolioBalance() {
    this.setState({
      portfolioBalance: '$' + SpotAPI.formatMoney(this.state.silver * this.state.silverWeight) + ' USD',
      portfolioBalanceLastUpdate: moment().format('MMM Do, h:mm:ss a')
    });
  }

  setTableSpotPrices() {
    this.setState({
      tableData: [
        [this.state.silverWeight + ' oz', '$' + SpotAPI.formatMoney(this.state.silver), '$' + SpotAPI.formatMoney(this.state.silver * this.state.silverWeight)],
        [this.state.goldWeight + ' oz', '$' + SpotAPI.formatMoney(this.state.gold), '$' + SpotAPI.formatMoney(this.state.gold * this.state.goldWeight)],
        [this.state.platinumWeight + ' oz', '$' + SpotAPI.formatMoney(this.state.platinum), '$' + SpotAPI.formatMoney(this.state.platinum * this.state.platinumWeight)],
        [this.state.palladiumWeight + ' oz', '$' + SpotAPI.formatMoney(this.state.palladium), '$' + SpotAPI.formatMoney(this.state.palladium * this.state.palladiumWeight)],      ]
    })
  };

  _onRefresh = () => {
    this.setState({refreshing: true});
    this.getPortfolioWeightsFromStorage();
    this.getLatestPrices();
    this.setState({refreshing: false});
  }

  componentWillMount() {
    this.getLatestPrices();
    this.getPortfolioWeightsFromStorage();
  };

  componentDidUpdate(prevProps) {
    if (prevProps.isFocused !== this.props.isFocused) {
      // Use the `this.props.isFocused` boolean
      // Call any action
      this._onRefresh();
    }
  }

  render() {
    const state = this.state;
    return (
      <View style={styles.container}>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
        >
          {/*<DevelopmentModeNotice />*/}
          <View style={styles.totalContainer}>
            <TouchableOpacity onPress={() => handleTotalPress(this)} style={styles.touchLink}>
              <Text style={styles.totalDollarAmt}>
                {this.state.portfolioBalance}
              </Text>
              <Text style={styles.totalBanner}>
                Current Portfolio Balance
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'],
                datasets: [{
                  data: [
                    Math.random() * 1000,
                    Math.random() * 1000,
                    Math.random() * 1000,
                    Math.random() * 1000,
                    Math.random() * 1000,
                    Math.random() * 1000,
                    Math.random() * 1000
                  ]
                }]
              }}
              width={Dimensions.get('window').width - 10} // from react-native
              height={Dimensions.get('window').height * .40}
              yAxisLabel={'$'}
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 10
                }
              }}
              bezier
              style={{
                borderRadius: 10
              }}
            />
          </View>

          <View style={styles.tableContainer}>
            <Table>
              <Row data={state.tableHead} flexArr={[1, 1, 1, 1]} style={styles.head} textStyle={styles.text}/>
              <TableWrapper style={styles.wrapper}>
                <Col data={state.tableTitle} style={styles.title} heightArr={[35,35]} textStyle={styles.text}/>
                <Rows data={state.tableData} flexArr={[1, 1, 1]} style={styles.row} textStyle={styles.text}/>
              </TableWrapper>
            </Table>
          </View>

          <View style={styles.footerContainer}>
            <TouchableOpacity onPress={handleSitePress} style={styles.touchLink}>
              <Text style={styles.footerLinkText}>
                Spot
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <TouchableOpacity onPress={() => handleUpdatePress(this)} style={styles.touchLink}>
              <Text style={styles.footerLinkText}>
                Last Update: {this.state.portfolioBalanceLastUpdate}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
}

HomeScreen.navigationOptions = {
  header: null,
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled
      </Text>
    );
  }
}

function handleTotalPress(context) {
  context.props.navigation.navigate('Portfolio');
}

function handleUpdatePress(context) {
  context.getLatestPrices();
}

function handleSitePress() {
  WebBrowser.openBrowserAsync(
    'https://github.com/Fairbanks-io/Spot'
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 10,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center'
  },
  contentContainer: {
    paddingTop: 30,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  totalContainer: {
    marginTop: 5,
    alignItems: 'center',
  },
  totalBanner: {
    paddingVertical: 5,
    color: 'grey',
    fontSize: 12,
    textAlign: 'center'
  },
  totalDollarAmt: {
    fontSize: 25
  },
  tableContainer: { 
    flex: 1, 
    padding: 16, 
    paddingTop: 5, 
    backgroundColor: '#fff' 
  },
  head: {  
    height: 40,  
    backgroundColor: '#f1f8ff'
  },
  wrapper: { 
    flexDirection: 'row' 
  },
  title: { 
    flex: 1, 
    backgroundColor: '#f6f8fa'
  },
  row: {  
    height: 35  
  },
  text: { 
    textAlign: 'center' 
  },
  footerContainer: {
    marginTop: 5,
    alignItems: 'center',
  },
  footerLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  touchLink: {
    paddingVertical: 5,
  },
});
