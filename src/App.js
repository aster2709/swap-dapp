import React from "react";
import Web3 from "web3";
import IERC20 from "./ethereum/artifacts/IERC20.json";
import Swap from "./ethereum/artifacts/Swap.json";
import { Form, Button, Card } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

let web3, accounts, swapInstance, tokenInstance, totalBalance, balance;

class App extends React.Component {
  state = {
    tokenAddress: "",
    amount: "",
    contractAddress: "0xd3CfFe1d111Cdc6a20Fd401C6Ede79fb2d3b528A",
    errorMessage: "",
    loading: false,
    balance: "",
    totalBalance: "",
  };

  loadWeb3 = async () => {
    const { ethereum } = window;
    web3 = new Web3(ethereum);
    accounts = await ethereum.request({ method: "eth_requestAccounts" });
    console.log(accounts);
    swapInstance = await new web3.eth.Contract(
      Swap.abi,
      this.state.contractAddress
    );
    totalBalance = await swapInstance.methods.getTotalBalance().call();
    this.setState({ totalBalance });
    balance = await swapInstance.methods
      .getBalance()
      .call({ from: accounts[0] });
    this.setState({ balance });
  };
  async componentDidMount() {
    await this.loadWeb3();
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, errorMessage: "" });
    try {
      tokenInstance = await new web3.eth.Contract(
        IERC20.abi,
        this.state.tokenAddress
      );
      await tokenInstance.methods
        .approve(this.state.contractAddress, this.state.amount)
        .send({ from: accounts[0] });
      await swapInstance.methods
        .swap(this.state.tokenAddress, this.state.amount)
        .send({ from: accounts[0] });
      window.location.reload();
    } catch (err) {
      this.setState({ errorMessage: err.message, loading: false });
    }
  };

  withdraw = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, errorMessage: "" });
    try {
      await swapInstance.methods.withdrawBalance().send({ from: accounts[0] });
      window.location.reload();
    } catch (err) {
      this.setState({ errorMessage: err.message, loading: false });
    }
  };

  render() {
    return (
      <div style={{ padding: "10px" }}>
        <h2 style={{ color: "green" }}>
          {this.state.loading ? "⏳Transcation pending, please wait" : null}
        </h2>

        <h3 style={{ color: "red" }}>
          {!!this.state.errorMessage ? this.state.errorMessage : null}
        </h3>

        <div style={{ maxWidth: "500px" }}>
          <h3>Swap</h3>
          <Form onSubmit={this.handleSubmit}>
            <div>
              <Form.Input
                label="Token Address"
                type="text"
                value={this.state.tokenAddress}
                onChange={(e) =>
                  this.setState({ tokenAddress: e.target.value })
                }
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <Form.Input
                label="Amount inlcuding all required zeros"
                type="text"
                value={this.state.amount}
                onChange={(e) => this.setState({ amount: e.target.value })}
              />
            </div>
            <Button primary style={{}}>
              Submit
            </Button>
          </Form>
        </div>

        <Card>
          <Card.Content>
            <Card.Header content="Total Balance in Contract" />
            <Card.Meta
              content={
                this.state.totalBalance
                  ? web3.utils.fromWei(this.state.totalBalance, "ether")
                  : "0"
              }
            />
            <Card.Description content="This is the total ETH in contract" />
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <Card.Header content="Your Balance" />
            <Card.Meta
              content={
                this.state.balance
                  ? web3.utils.fromWei(this.state.totalBalance, "ether")
                  : "0"
              }
            />
            <Card.Description content="This is your balance in ETH" />
          </Card.Content>
        </Card>

        <Button primary onClick={this.withdraw}>
          Withdraw
        </Button>
      </div>
    );
  }
}

export default App;
