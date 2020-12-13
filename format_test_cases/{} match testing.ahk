{::
    if () 
    {
        ok:="}"
        ok:="{"
        ok:="}:"
        ok:="{:"
        ok:="{}"
        sleep, 100
        ok:={a:[{b:1,a:3,c:{1,2,3}},{b:1,a:3,c:{1,2,3}},{b:1,a:3,c:{1,2,3}}]}
        ok:={b:1,a:3,c:{1,2,3}}
        ok:={b:1,a:3}
        sleep, 100
        if (true) {
            sleep, 100
        } else {
            send, {{}{}}{left}
        }
    } 
    else 
    {
        send, {{}
    }
}

return
f1::
    sleep, 100
return
f2::
    sleep, 100
return
}::
return
f3::Exitapp