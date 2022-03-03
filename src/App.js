import React, {useEffect, useState} from 'react';
import "./App.css";
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider'
import {loadContract} from "./utils/load-contract";

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null
  })

  const [balance, setBalance] = useState(null)
  const [accounts, setAccount] = useState(null)

  const canConnect = accounts && web3Api.contract

  const setAccountListener = provider => {
    provider.on("accountsChanged", accounts => window.location.reload())

    provider.on("chainChanged", accounts => window.location.reload())
  }

  useEffect(() => {
    const loadProvider = async() => {
      const provider = await detectEthereumProvider()
      const contract = await loadContract("Faucet", provider)

      if(provider){
        
        setAccountListener(provider)
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract
        })

      }
      else{
        console.error("Please install Metamask!")
      }  
    }

    loadProvider()
  }, [])

  useEffect(() => {
    const loadBalance = async() => {
        const {contract, web3} = web3Api
        const balance = await web3.eth.getBalance(contract.address)
        setBalance(web3.utils.fromWei(balance, "ether"))
    }

    web3Api.contract && loadBalance()
  }, [web3Api])

  useEffect(() => {

    const getAccount = async() => {
        const accounts = await web3Api.web3.eth.getAccounts()
        setAccount(accounts[0])
    }

    web3Api.web3 && getAccount()

  }, [web3Api.web3])

  // function to add funds
  const addFunds = async() => {
    const {contract, web3} = web3Api
    await contract.addFunds({
      from: accounts,
      value: web3.utils.toWei("1", "ether")
    })

    window.location.reload()
  }

  // function to withdraw funds
  const withdraw = async() => {
    const {contract, web3} = web3Api
    const withdrawAmount = web3.utils.toWei("0.5", "ether")
    await contract.withdraw(withdrawAmount, {
      from: accounts
    })

    window.location.reload()
  }

  return (
    <div className="App">
      <div className="faucet-wrapper">
          <div className="faucet">
            <span>
              <strong>Account: </strong>
            </span>
            <h1>
              {accounts ? accounts : <button className="button mr-2" onClick={() => web3Api.provider.request({method: "eth_requestAccounts"})}>Connect</button>}  
            </h1>  
              <div className="balance-view is-size-2 mb-3">
                  Current Balance: <strong>{balance}</strong> ETH
              </div>
              {
                !canConnect && <i className="is-block">Connect to Ganache</i>
              }

              <button disabled={!canConnect} className="button mr-2 is-link" onClick={addFunds}>Donate 1ETH</button>
              <button disabled={!canConnect} className="button is-primary" onClick={withdraw}>Withdraw</button>
          </div>
      </div>
    </div>
  );
}

export default App;
