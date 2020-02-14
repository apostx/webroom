# WebRoom Project

This project was inspired by Java Servlets and its runtime environments.
The webroom server collected the most common websocket related logics to help the developer focusing more on the business loginc instead of the technical solutions. 

### WebRoomServer:

- Providing the list of running rooms based on the requested room type [http] (E.g. /get_room_list?room_type=echo)
- Joining an opened room by room id [ws] (E.g. /join_room?room_id=0)
- Opening new room and joining to it [ws] (E.g. /create_room?room_type=echo)

### WebRoom:

- This is the room logic which needs to be implement by the developer (see AbstractWebRoom)

### AbstractWebRoom:

- `get details()`: Provides extra information in the room list service
- `get isHidden()`: The current room will not be shown by the room list service
- `validateRequest(request)`: Can prevent to upgrade the http connection to websocket
- `join(socket)`: Here the WebRoom get the validated websocket connection
- `destroy()`: Notifies the WebRoomServer about the lifetime of the current room is over so it can be destroyed


## Demo

* (offline) http://web-room.herokuapp.com/offline
* (http+ws) http://web-room.herokuapp.com
* (ws) http://web-room.herokuapp.com/online_v2
