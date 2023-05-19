const Notification = ({ message, type }) => {

  if (message === null) {
    return null
  }

  if (type === 'E'){
    return (
      <div className='error'>
        {message}
      </div>
    )
  }
  else{

    return (
      <div className='success'>
        {message}
      </div>
    )

  }
}


export default Notification