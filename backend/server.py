from http.server import ThreadingHTTPServer

from api.http import AppHandler
from config import HOST, PORT


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f'Process Intelligence MVP is running at http://{HOST}:{PORT}')
    print(f'API health check: http://{HOST}:{PORT}/api/health')
    server.serve_forever()


if __name__ == '__main__':
    main()
