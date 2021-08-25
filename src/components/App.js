import React, { Component } from 'react'
import Web3 from 'web3'
import './App.css'
import TodoList from './TodoList'
import TodoListDATA from '../abis/TodoList.json'



class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      taskCount: 0,
      tasks: [],
      loading: true
    }
      this.createTask = this.createTask.bind(this)
      this.toggleCompleted = this.toggleCompleted.bind(this)

  }

  componentWillMount() {
    this.loadBlockchainData()
    this.setState({ loading: false })
  }

  async loadBlockchainData() {

    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    console.log("accounts ", accounts)
    this.setState({ account: accounts[0] })
    
    const networkId = await web3.eth.net.getId()
    console.log("networkId ", networkId)
    
    const networkData = TodoListDATA.networks[networkId]   
    console.log("networkData ", networkData)

    if(networkData) {
      const todoList = web3.eth.Contract(TodoListDATA.abi, networkData.address)
      console.log(todoList)

      this.setState({ todoList })
 
      // Fetch the taskCount
      const taskCount = await todoList.methods.taskCount().call()
      console.log(taskCount)
      this.setState({ taskCount })

    // Load Todos
      for (var i = 1; i <= taskCount; i++) {
        const task = await todoList.methods.tasks(i).call()
        console.log(task)
        this.setState({
          tasks: [...this.state.tasks, task]
        })
      }


      this.setState({ loading: false})
    } else {
      window.alert('todoList contract not deployed to detected network.')
    }
  }

  async createTask(content) {
    this.setState({ loading: true })
    this.state.todoList.methods.createTask(content).send({ from: this.state.account })
    .on("confirmation", (confirmationNumber, receipt)=> {
      console.log(confirmationNumber)
      console.log(receipt)
      this.setState({ loading: false })
    })
    .on("error", (error)=> {
      console.log(error)
      alert(error.message)
      this.setState({ loading: false })
    })

  }

  async toggleCompleted(task) {
    this.setState({ loading: true })
    this.state.todoList.methods.toggleCompleted(task.id).send({ from: this.state.account })
    .on("confirmation", (confirmationNumber, receipt)=> {
      console.log(confirmationNumber)
      console.log(receipt)
      this.setState({ loading: false })

    })
    .on("error", (error)=> {
      console.log(error)
      alert(error.message)
      this.setState({ loading: false })
    })
  }
  
  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="http://www.dappuniversity.com/free-download" target="_blank">Dapp University | Todo List</a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small><a className="nav-link" href="#"><span id="account"></span></a></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex justify-content-center">
              {this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <TodoList tasks={this.state.tasks} createTask={this.createTask} toggleCompleted = {this.toggleCompleted} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }

}

export default App;

