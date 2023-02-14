import { createNymMixnetClient, NymMixnetClient } from "@nymproject/sdk";
import { useEffect, useState } from "react";
import "./App.css";

const nymApiUrl = "https://validator.nymtech.net/api";

function App() {
  const inputValue = document.getElementById("input") as HTMLInputElement;
  const [nymClient, setNymClient] = useState<NymMixnetClient>();
  const [address, setAddress] = useState<string>();
  const [messages, setMessages] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    (async () => {
      const client = await createNymMixnetClient();
      await client.client.start({
        clientId: "My awesome client",
        nymApiUrl,
      });
      setNymClient(client);
    })();
  }, []);

  const handleSend = async () => {
    if (address) {
      const payload = {
        message: JSON.stringify({
          message: inputValue.value,
          from: address.slice(0, 10) + "...",
        }),
        mimeType: "text/plain",
      };
      setIsSending(true);
      await nymClient?.client.send({
        recipient: address,
        payload,
      });
    }
  };

  nymClient?.events.subscribeToConnected(async () => {
    setAddress(await nymClient.client.selfAddress());
    await nymClient.events.subscribeToTextMessageReceivedEvent((e) => {
      setMessages((msgs) => [...msgs, e.args.payload]);
      setIsSending(false);
      inputValue.value = "";
    });
  });

  return (
    <div className="App">
      <h3>{!address ? "Connecting.." : `Address: ${address}`}</h3>
      <input type="text" style={{ marginRight: 15, fontSize: 25 }} id="input" />
      {isSending ? (
        <div style={{ display: "inline" }}>Sending ...</div>
      ) : (
        <button onClick={handleSend}>Send</button>
      )}
      <div style={{ marginTop: 15 }}>
        {messages.map((message, i) => (
          <code style={{ fontSize: 25, display: "block" }} key={i}>
            {message}
          </code>
        ))}
      </div>
    </div>
  );
}

export default App;
