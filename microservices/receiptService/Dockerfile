FROM python:3.9-slim

WORKDIR /app

RUN pip install flask==2.0.1
RUN pip install flask-cors==3.0.10
RUN pip install Werkzeug==2.0.1


COPY . .

RUN mkdir -p /app/downloads

EXPOSE 8081

CMD ["python", "receiptservice.py"]