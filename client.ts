import * as ssh2 from 'ssh2'

const connection = new ssh2.Client()
connection.on('ready', function() {
  console.log('Client authenticated!')
  return connection.sftp(function (err, sftp) {
    if (err) {
      return console.error('SFTP error: ', err)
    }
    console.log('SFTP connected')
    return sftp.fastPut('./test.csv', 'test123.csv', function (err) {
      if (err) {
        return console.error('fastPut error: ', err)
      }
      console.log('File uploaded')
    })
  })
})

connection.on('error', function(err) {
  console.error(err)
})

connection.connect({
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT) || 22,
  username: 'user',
  password: process.env.PASSWORD,
})
