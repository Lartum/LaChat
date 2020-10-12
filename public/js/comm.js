const socket = io()

//Elements
const $messageForm = document.querySelector("#messageForm")
const $messageHolder = document.querySelector("#messageHolder")
const $sendMessageButton = document.querySelector("#sendMessageButton")
const $sendLocationButton = document.querySelector("#sendLocation")
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const $messageTemplate = document.querySelector('#messageTemplate').innerHTML
const $locationMessageTemplate = document.querySelector('#locationMessageTemplate').innerHTML
const $sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML

//Query strings options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    //New Message Element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //Determine how far user has scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) =>{
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('ddd, ha')   
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})


socket.on('locationMessage', (data) => {
    const html = Mustache.render($locationMessageTemplate, {
        username: data.username,
        link: data.link,
        createdAt: moment(data.createdAt).format('ddd, ha') 
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ users, room }) =>{
     const html = Mustache.render($sidebarTemplate, {
         users,
         room
     })
     $sidebar.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener("submit", (e)=>{
        const message = e.target.elements.messageHolder.value
        e.preventDefault()

        $sendMessageButton.setAttribute('disabled','disabled')
        socket.emit('sendMessage', message, () =>{
            $messageHolder.value = ''
            $sendMessageButton.removeAttribute('disabled')
            $messageHolder.focus()
            console.log('your message was delivered')
        })
    })


$sendLocationButton.addEventListener('click', (e) => {
        e.preventDefault()
        $sendLocationButton.setAttribute('disabled','disabled')
        if(!navigator.geolocation){
            return alert('no navigator method found in the system')
        }

        navigator.geolocation.getCurrentPosition((location) => {
            socket.emit('sendLocation', {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }, (error) => {
               if(error){
                  return console.log(error)
               }

               $sendLocationButton.removeAttribute('disabled')
               console.log('Location was shared')
            })
        })
        
})    


socket.emit('joinRoom', { username, room}, (error) => {
        if(error){
            alert(error)
            location.href = '/'
        }
})
